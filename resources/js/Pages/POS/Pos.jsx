import React, { useState, useMemo, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ProductSection from "@/Components/Pos/ProductSection";
import CartSection from "@/Components/Pos/CartSection";
import ProductOptionsModal from "@/Components/Pos/ProductOptionsModal";
import {
    ShoppingBag,
    Coins,
    QrCode
} from "lucide-react";

const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function Pos({ products = [], categories = [], sizes = [], orderNumber }) {
    // Search and Category states
    const [search, setSearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [activeTab, setActiveTab] = useState("products"); // products, cart

    // Cart state
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("pos_cart");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Options Modal state
    const [optionModalOpen, setOptionModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [tempSelectedOptions, setTempSelectedOptions] = useState({});
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [optionError, setOptionError] = useState("");



    const getProductSizes = (product) => {
        if (!product?.size) return [];
        return String(product.size)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    };

    const getProductTypes = (product) => {
        if (!product?.type) return [];
        return String(product.type)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    };

    // Inertia Form for Checkout
    const { data, setData, post, processing, errors, reset } = useForm({
        order_number: orderNumber,
        customer_name: "",
        phone_number: "",
        order_type: "Dine In", // Dine In, Take Away
        order_date: new Date().toISOString().split("T")[0],
        order_method: "walk_in_order", // walk_in_order, qr_order
        payment_method: "cash", // cash, qr pay
        status: "unpaid", // unpaid, preparing, ready, completed, cancelled
        notes: "",
        items: [],
    });

    // Synchronize cart changes to form data items
    useEffect(() => {
        const itemsPayload = cart.map((item) => {
            const itemBaseTotal = item.price * item.quantity;
            const itemDiscountPercent = Number(item.discount || 0);
            const absoluteDiscount = itemBaseTotal * (itemDiscountPercent / 100);

            return {
                product_id: item.product.id,
                quantity: item.quantity,
                discount: Number(absoluteDiscount.toFixed(2)),
                size: item.size,
                type: item.type,
                selected_options: item.selected_options.map((opt) => ({
                    product_option_id: opt.product_option_id,
                    product_option_value_id: opt.product_option_value_id,
                    option_label: opt.option_label,
                    value_label: opt.value_label,
                })),
            };
        });
        setData("items", itemsPayload);
        localStorage.setItem("pos_cart", JSON.stringify(cart));
    }, [cart]);



    // Parent Categories (root level)
    const parentCategories = useMemo(() => {
        return categories.filter((c) => !c.parent_id);
    }, [categories]);

    // Subcategories grouped by parent
    const subCategoriesMap = useMemo(() => {
        const map = {};
        categories.forEach((c) => {
            if (c.parent_id) {
                if (!map[c.parent_id]) map[c.parent_id] = [];
                map[c.parent_id].push(c);
            }
        });
        return map;
    }, [categories]);

    // Filter products based on search term and category selection
    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (selectedCategoryId) {
            // Include parent category products and any of its subcategories
            const subIds = categories
                .filter((c) => c.parent_id === selectedCategoryId)
                .map((c) => c.id);
            const targetIds = [selectedCategoryId, ...subIds];
            filtered = filtered.filter((p) => targetIds.includes(p.category_id));
        }

        if (search.trim()) {
            const term = search.toLowerCase();
            filtered = filtered.filter((p) => {
                const nameMatch = p.name?.toLowerCase().includes(term);
                return nameMatch;
            });
        }

        return filtered;
    }, [products, selectedCategoryId, categories, search]);

    // Add to cart trigger
    const handleAddToCartClick = (product) => {
        const hasStock = product?.stock !== null && product?.stock !== undefined && product?.stock !== "";
        if (hasStock && Number(product.stock) <= 0) return;

        const productSizes = getProductSizes(product);
        const productTypes = getProductTypes(product);
        if ((product.options && product.options.length > 0) || productSizes.length > 1 || productTypes.length > 1) {
            // Open modal to configure options/size/type
            setCurrentProduct(product);

            // Set default selections
            const defaults = {};
            product.options.forEach((opt) => {
                // If it has values, select the first one by default if required
                if (opt.values && opt.values.length > 0 && opt.is_required) {
                    defaults[opt.id] = opt.values[0];
                }
            });
            setTempSelectedOptions(defaults);
            setSelectedSize(productSizes[0] || "");
            setSelectedType(productTypes[0] || "");
            setOptionError("");
            setOptionModalOpen(true);
        } else {
            // Add directly
            addToCartDirectly(product, [], productSizes[0] || "", productTypes[0] || "");
        }
    };

    const addToCartDirectly = (product, selectedOpts, sizeVal, typeVal) => {
        const optionUpcharges = selectedOpts.reduce((sum, opt) => sum + Number(opt.upcharge || 0), 0);

        // Find matching size to calculate upcharge
        const matchingSize = sizeVal
            ? sizes.find((s) => s.title.toLowerCase() === sizeVal.toLowerCase())
            : null;
        const sizeUpcharge = matchingSize ? Number(matchingSize.upcharge || 0) : 0;

        const itemPrice = Number(product.price) + optionUpcharges + sizeUpcharge;
        const sortedOptIds = selectedOpts
            .map((o) => o.product_option_value_id)
            .sort((a, b) => a - b);
        const cartItemId = product.id + "_" + (sizeVal || "default") + "_" + (typeVal || "default") + (sortedOptIds.length > 0 ? "_" + sortedOptIds.join("_") : "");

        setCart((prev) => {
            const existing = prev.find((item) => item.id === cartItemId);
            if (existing) {
                return prev.map((item) =>
                    item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [
                    ...prev,
                    {
                        id: cartItemId,
                        product,
                        quantity: 1,
                        discount: 0,
                        price: itemPrice,
                        size: sizeVal || null,
                        type: typeVal || null,
                        selected_options: selectedOpts,
                    },
                ];
            }
        });
    };

    // Confirm options in modal
    const handleConfirmOptions = () => {
        if (!currentProduct) return;

        // Check if all required options are selected
        const missingRequired = currentProduct.options.filter(
            (opt) => opt.is_required && !tempSelectedOptions[opt.id]
        );

        if (missingRequired.length > 0) {
            setOptionError(
                `Please select required options: ${missingRequired.map((o) => o.name).join(", ")}`
            );
            return;
        }

        const selectedOpts = currentProduct.options
            .map((opt) => {
                const val = tempSelectedOptions[opt.id];
                if (!val) return null;
                return {
                    product_option_id: opt.id,
                    product_option_value_id: val.id,
                    option_label: opt.name,
                    value_label: val.value,
                    upcharge: Number(val.upcharge || 0),
                };
            })
            .filter(Boolean);

        addToCartDirectly(currentProduct, selectedOpts, selectedSize, selectedType);
        setOptionModalOpen(false);
        setCurrentProduct(null);
        setTempSelectedOptions({});
        setSelectedSize("");
        setSelectedType("");
    };

    // Update option selection
    const handleOptionSelect = (optionId, valueObj) => {
        setTempSelectedOptions((prev) => {
            const currentSelected = prev[optionId];
            if (currentSelected && currentSelected.id === valueObj.id) {
                const updated = { ...prev };
                delete updated[optionId];
                return updated;
            }
            return {
                ...prev,
                [optionId]: valueObj,
            };
        });
    };

    // Update quantity
    const updateQuantity = (itemId, delta) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id === itemId) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    // Update item discount
    const updateItemDiscount = (itemId, val) => {
        if (val === "") {
            setCart((prev) =>
                prev.map((item) =>
                    item.id === itemId ? { ...item, discount: "" } : item
                )
            );
            return;
        }
        // Cap percentage between 0% and 100%
        const percentage = Math.min(100, Math.max(0, Number(val)));
        setCart((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, discount: percentage } : item
            )
        );
    };

    // Remove from cart
    const removeCartItem = (itemId) => {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
    };

    // Calculate Totals
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const discountTotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const itemBaseTotal = item.price * item.quantity;
            const itemDiscountPercent = Number(item.discount || 0);
            return sum + (itemBaseTotal * (itemDiscountPercent / 100));
        }, 0);
    }, [cart]);

    const totalAmount = useMemo(() => {
        return Math.max(0, subtotal - discountTotal);
    }, [subtotal, discountTotal]);

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Cart is empty. Please add some products.");
            return;
        }

        post(route("orders.store"), {
            onSuccess: () => {
                reset();
                clearCart();
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="POS Checkout" />

            <main className="flex flex-col lg:flex-row h-[calc(100vh-57px)] w-full overflow-hidden bg-[#fcf9f7] relative">
                {/* Mobile Tab Switcher */}
                <div className="lg:hidden flex border-b border-[#eadfda] bg-white p-2 shrink-0 w-full sticky top-0 z-30">
                    <button
                        type="button"
                        onClick={() => setActiveTab("products")}
                        className={`flex-1 py-2 text-center text-sm font-bold rounded-xl transition ${activeTab === "products"
                            ? "bg-primary-dark text-white"
                            : "text-secondary-dark hover:bg-[#fbf8f5]"
                            }`}
                    >
                        Products ({filteredProducts.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("cart")}
                        className={`flex-1 py-2 text-center text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${activeTab === "cart"
                            ? "bg-primary-dark text-white"
                            : "text-secondary-dark hover:bg-[#fbf8f5]"
                            }`}
                    >
                        <ShoppingBag size={16} />
                        Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)}) - ${formatPrice(totalAmount)}
                    </button>
                </div>

                {/* Left Side: Product browsing */}
                <ProductSection
                    activeTab={activeTab}
                    orderNumber={data.order_number}
                    search={search}
                    setSearch={setSearch}
                    selectedCategoryId={selectedCategoryId}
                    setSelectedCategoryId={setSelectedCategoryId}
                    parentCategories={parentCategories}
                    subCategoriesMap={subCategoriesMap}
                    filteredProducts={filteredProducts}
                    onAddToCart={handleAddToCartClick}
                />

                {/* Right Side: Sticky Checkout Cart panel */}
                <CartSection
                    activeTab={activeTab}
                    cart={cart}
                    clearCart={clearCart}
                    removeCartItem={removeCartItem}
                    updateQuantity={updateQuantity}
                    updateItemDiscount={updateItemDiscount}
                    handleSubmit={handleSubmit}
                    errors={errors}
                    data={data}
                    setData={setData}
                    processing={processing}
                    subtotal={subtotal}
                    discountTotal={discountTotal}
                    totalAmount={totalAmount}
                />
                {/* Mobile Floating Checkout FAB */}
                {activeTab === "products" && cart.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setActiveTab("cart")}
                        className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-full p-4 shadow-xl flex items-center gap-2 transition transform hover:scale-105 active:scale-95 animate-bounce"
                    >
                        <ShoppingBag size={20} />
                        <span className="text-xs font-bold bg-white text-[#5a3630] rounded-full px-2 py-0.5">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                        <span className="text-sm font-bold">Checkout</span>
                    </button>
                )}
            </main>

            {/* Configurable Product Options Modal */}
            <ProductOptionsModal
                isOpen={optionModalOpen}
                onClose={() => setOptionModalOpen(false)}
                product={currentProduct}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                sizes={sizes}
                tempSelectedOptions={tempSelectedOptions}
                onOptionSelect={handleOptionSelect}
                optionError={optionError}
                onConfirm={handleConfirmOptions}
            />
        </AdminLayout>
    );
}