import React, { useState, useMemo, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import CartSidebar from "@/Components/CustomerOrder/CartSidebar";
import CartDrawer from "@/Components/CustomerOrder/CartDrawer";
import ProductOptionsModal from "@/Components/CustomerOrder/ProductOptionsModal";
import GuestHeader from "@/Components/CustomerOrder/GuestHeader";
import ProductMenu from "@/Components/CustomerOrder/ProductMenu";
import MobileCartBar from "@/Components/CustomerOrder/MobileCartBar";
import { toast } from "@/Components/ui/Toast";

export default function CustomerOrder({ products = [], categories = [], sizes = [], orderNumber, topSellingProducts = [] }) {
    // Search and Category states
    const [search, setSearch] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);

    // Cart state local persistence
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("client_order_cart");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Options Modal state
    const [optionModalOpen, setOptionModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [tempSelectedOptions, setTempSelectedOptions] = useState({});
    const [tempSelectedOptionsNotes, setTempSelectedOptionsNotes] = useState({});
    const [itemNote, setItemNote] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [optionError, setOptionError] = useState("");

    // Hook up form for checkout
    const { data, setData, post, processing, errors, reset } = useForm({
        order_number: orderNumber,
        customer_name: "",
        phone_number: "",
        order_type: "Dine In", // Dine In or Take Away
        order_date: new Date().toISOString().split("T")[0],
        order_method: "self_order", // self_order
        payment_method: "khqr", // khqr, cash
        status: "unpaid",
        notes: "",
        items: [],
    });

    // Save cart changes and sync with form items
    useEffect(() => {
        const itemsPayload = cart.map((item) => {
            const itemBaseTotal = item.price * item.quantity;
            const itemDiscountPercent = Number(item.discount || 0);
            const absoluteDiscount = itemBaseTotal * (itemDiscountPercent / 100);

            return {
                product_id: item.product.id,
                quantity: item.quantity,
                notes: item.notes || "",
                discount: Number(absoluteDiscount.toFixed(2)),
                size: item.size,
                type: item.type,
                selected_options: item.selected_options.map((opt) => ({
                    product_option_id: opt.product_option_id,
                    product_option_value_id: opt.product_option_value_id,
                    option_label: opt.option_label,
                    value_label: opt.value_label,
                    note: opt.note || "",
                })),
            };
        });

        setData("items", itemsPayload);
        localStorage.setItem("client_order_cart", JSON.stringify(cart));
    }, [cart]);



    // Handle order type selection changes
    const handleOrderTypeChange = (type) => {
        setData((prev) => ({
            ...prev,
            order_type: type,
            order_method: "self_order",
            phone_number: type === "Dine In" ? "" : prev.phone_number,
        }));
    };

    // Parent Categories & Subcategories
    const parentCategories = useMemo(() => {
        return categories.filter((c) => !c.parent_id);
    }, [categories]);

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

    // Filtered Products list
    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (selectedCategoryId) {
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
                const categoryMatch = p.category?.name?.toLowerCase().includes(term);
                return nameMatch || categoryMatch;
            });
        }

        return filtered;
    }, [products, selectedCategoryId, categories, search]);

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

    // Add to cart click
    const handleAddToCartClick = (product) => {
        const hasStock = product?.stock !== null && product?.stock !== undefined && product?.stock !== "";
        if (hasStock && Number(product.stock) <= 0) return;

        const productSizes = getProductSizes(product);
        const productTypes = getProductTypes(product);

        // If the product has options, multiple sizes, or multiple types, show the configuration modal
        if ((product.options && product.options.length > 0) || productSizes.length > 1 || productTypes.length > 1) {
            setCurrentProduct(product);

            // Populate defaults
            const defaults = {};
            product.options.forEach((opt) => {
                if (opt.values && opt.values.length > 0 && opt.is_required) {
                    defaults[opt.id] = opt.values[0];
                }
            });

            setTempSelectedOptions(defaults);
            setTempSelectedOptionsNotes({});
            setItemNote("");
            setSelectedSize(productSizes[0] || "");
            setSelectedType(productTypes[0] || "");
            setOptionError("");
            setOptionModalOpen(true);
        } else {
            addToCartDirectly(product, [], productSizes[0] || "", productTypes[0] || "", "");
        }
    };

    const addToCartDirectly = (product, selectedOpts, sizeVal, typeVal, itemNotes) => {
        const optionUpcharges = selectedOpts.reduce((sum, opt) => sum + Number(opt.upcharge || 0), 0);

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
                        notes: itemNotes || null,
                    },
                ];
            }
        });
        toast.success(`${product.name} added to cart!`);
    };

    const handleConfirmOptions = () => {
        if (!currentProduct) return;

        // Check required
        const missingRequired = currentProduct.options.filter(
            (opt) => opt.is_required && !tempSelectedOptions[opt.id]
        );

        if (missingRequired.length > 0) {
            const errMsg = `Please select required options: ${missingRequired.map((o) => o.name).join(", ")}`;
            setOptionError(errMsg);
            toast.warning(errMsg);
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
                    note: tempSelectedOptionsNotes[opt.id] || "",
                };
            })
            .filter(Boolean);

        addToCartDirectly(currentProduct, selectedOpts, selectedSize, selectedType, itemNote);
        setOptionModalOpen(false);
        setCurrentProduct(null);
        setTempSelectedOptions({});
        setTempSelectedOptionsNotes({});
        setItemNote("");
        setSelectedSize("");
        setSelectedType("");
    };

    const handleOptionSelect = (optionId, valueObj) => {
        setTempSelectedOptions((prev) => {
            const currentSelected = prev[optionId];
            if (currentSelected && currentSelected.id === valueObj.id) {
                const updated = { ...prev };
                delete updated[optionId];
                return updated;
            }
            return { ...prev, [optionId]: valueObj };
        });
    };

    // Quantity updates
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

    const removeCartItem = (itemId) => {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
    };

    // Calculate totals
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const totalAmount = useMemo(() => {
        return subtotal;
    }, [subtotal]);

    // Handle Submit
    const handleCheckoutSubmit = (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.warning("Your cart is empty!");
            return;
        }



        post(route("customer-order.store"), {
            onSuccess: () => {
                localStorage.removeItem("client_order_cart");
                setCart([]);
                setCartOpen(false);
                reset();
                toast.success("Order placed successfully!");
            },
            onError: () => {
                toast.failed("Failed to place order. Please check the details.");
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#fcf9f7] font-sans antialiased text-[#2f1a16] selection:bg-[#5a3630] selection:text-white">
            <Head title="Self Order Food & Drinks" />

            {/* Custom Premium Guest Header */}
            <GuestHeader
                setCartOpen={setCartOpen}
                cart={cart}
            />

            <main className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex flex-col lg:flex-row gap-8">
                {/* Left Side: Product Menu */}
                <ProductMenu
                    search={search}
                    setSearch={setSearch}
                    selectedCategoryId={selectedCategoryId}
                    setSelectedCategoryId={setSelectedCategoryId}
                    categories={categories}
                    parentCategories={parentCategories}
                    subCategoriesMap={subCategoriesMap}
                    filteredProducts={filteredProducts}
                    handleAddToCartClick={handleAddToCartClick}
                    topSellingProducts={topSellingProducts}
                />

                {/* Desktop Cart: Sticky Sidebar */}
                <CartSidebar
                    cart={cart}
                    handleCheckoutSubmit={handleCheckoutSubmit}
                    updateQuantity={updateQuantity}
                    handleOrderTypeChange={handleOrderTypeChange}
                    data={data}
                    setData={setData}
                    processing={processing}
                    totalAmount={totalAmount}
                    removeItem={removeCartItem}
                    errors={errors}
                />
            </main>

            {/* Mobile Bottom Floating Cart Bar */}
            <MobileCartBar
                cart={cart}
                setCartOpen={setCartOpen}
                totalAmount={totalAmount}
            />

            {/* Mobile slide-up Cart Drawer */}
            <CartDrawer
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
                cart={cart}
                handleCheckoutSubmit={handleCheckoutSubmit}
                updateQuantity={updateQuantity}
                handleOrderTypeChange={handleOrderTypeChange}
                data={data}
                setData={setData}
                processing={processing}
                totalAmount={totalAmount}
                removeItem={removeCartItem}
                errors={errors}
            />

            {/* Configurable Product Options Modal */}
            <ProductOptionsModal
                isOpen={optionModalOpen}
                setIsOpen={setOptionModalOpen}
                currentProduct={currentProduct}
                tempSelectedOptions={tempSelectedOptions}
                tempSelectedOptionsNotes={tempSelectedOptionsNotes}
                setTempSelectedOptionsNotes={setTempSelectedOptionsNotes}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                optionError={optionError}
                sizes={sizes}
                handleOptionSelect={handleOptionSelect}
                handleConfirmOptions={handleConfirmOptions}
                itemNote={itemNote}
                setItemNote={setItemNote}
            />
        </div>
    );
}
