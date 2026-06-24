import React from "react";
import { ShoppingBag, X } from "lucide-react";
import Modal from "@/Components/Modal";

const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

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

const getProductOptions = (product) => {
    if (!product?.options) return [];
    if (Array.isArray(product.options)) return product.options;
    return [];
};

export default function ProductOptionsModal({
    isOpen,
    onClose,
    product,
    selectedSize,
    setSelectedSize,
    selectedType,
    setSelectedType,
    sizes = [],
    tempSelectedOptions = {},
    onOptionSelect,
    optionError,
    onConfirm,
}) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            <div className="px-6 py-10 bg-white rounded-3xl relative mt-10">

                {product && (
                    <div className="space-y-6">
                        {/* Product Summary */}
                        <header className="flex justify-between items-start border-b border-[#f3ede9] pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#eee4de] overflow-hidden shrink-0 flex items-center justify-center">
                                    {product.image_path ? (
                                        <img
                                            src={`/storage/${product.image_path}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ShoppingBag size={24} className="text-secondary-dark" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xl font-bold text-[#2f1a16]">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm font-semibold text-[#c07a49] mt-0.5">
                                        Base Price: ${formatPrice(product.price)}
                                    </p>
                                </div>

                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-secondary-dark transition"
                                aria-label="Close options"
                            >
                                <X size={30} />
                            </button>
                        </header>

                        {/* Option selections */}
                        <div className="space-y-6">
                            {/* Size selection */}
                            {getProductSizes(product).length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-base font-bold text-[#4a2e2b] flex items-center gap-1.5">
                                        Size
                                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                            Required
                                        </span>
                                    </h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {getProductSizes(product).map((sz) => {
                                            const isSelected = selectedSize === sz;
                                            const sizeObj = sizes.find(s => s.title.toLowerCase() === sz.toLowerCase());
                                            const upcharge = sizeObj ? Number(sizeObj.upcharge || 0) : 0;
                                            return (
                                                <button
                                                    key={sz}
                                                    type="button"
                                                    onClick={() => setSelectedSize(sz)}
                                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border ${isSelected
                                                        ? "bg-[#5a3630] border-[#5a3630] text-white shadow-sm"
                                                        : "bg-white border-[#e8dfda] text-[#1e293b] hover:bg-[#fbf8f5] shadow-sm"
                                                        }`}
                                                >
                                                    <span>{sz}</span>
                                                    {upcharge > 0 && (
                                                        <span className={`ml-1.5 text-xs font-semibold ${isSelected ? "text-white/85" : "text-[#c07a49]"
                                                            }`}>
                                                            (+${formatPrice(upcharge)})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Type selection */}
                            {getProductTypes(product).length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-base font-bold text-[#4a2e2b] flex items-center gap-2">
                                        Type
                                        <span className="text-xs bg-danger-bg text-danger px-2 py-0.5 rounded-full font-bold">
                                            Required
                                        </span>
                                    </h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {getProductTypes(product).map((tp) => {
                                            const isSelected = selectedType === tp;
                                            return (
                                                <button
                                                    key={tp}
                                                    type="button"
                                                    onClick={() => setSelectedType(tp)}
                                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border ${isSelected
                                                        ? "bg-[#5a3630] border-[#5a3630] text-white shadow-sm"
                                                        : "bg-white border-[#e8dfda] text-primary-text hover:bg-[#fbf8f5] shadow-sm"
                                                        }`}
                                                >
                                                    <span>{tp}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {getProductOptions(product).map((opt) => (
                                <div key={opt.id} className="space-y-3">
                                    <h4 className="text-base font-bold text-[#4a2e2b] flex items-center gap-2">
                                        {opt.name}
                                        {opt.is_required && (
                                            <span className="text-xs bg-danger-bg text-danger px-2 py-0.5 rounded-full font-bold">
                                                Required
                                            </span>
                                        )}
                                    </h4>

                                    <div className="flex flex-wrap gap-2.5">
                                        {opt.values &&
                                            opt.values.map((val) => {
                                                const isSelected =
                                                    tempSelectedOptions[opt.id]?.id === val.id;
                                                return (
                                                    <button
                                                        key={val.id}
                                                        type="button"
                                                        onClick={() =>
                                                            onOptionSelect(opt.id, val)
                                                        }
                                                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border ${isSelected
                                                            ? "bg-[#5a3630] border-[#5a3630] text-white shadow-sm"
                                                            : "bg-white border-[#e8dfda] text-primary-text hover:bg-[#fbf8f5] shadow-sm"
                                                            }`}
                                                    >
                                                        <span>{val.value}</span>
                                                        {Number(val.upcharge) > 0 && (
                                                            <span className={`ml-1.5 text-xs font-semibold ${isSelected ? "text-white/85" : "text-[#c07a49]"
                                                                }`}>
                                                                (+${formatPrice(val.upcharge)})
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Error alert */}
                        {optionError && (
                            <div className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                                {optionError}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <footer className="flex gap-3 pt-4 border-t border-[#f3ede9]">
                            <button
                                type="button"
                                onClick={onConfirm}
                                className="flex-1 h-11 bg-[#5a3630] hover:bg-[#4a2b25] text-white text-sm font-bold rounded-full transition shadow"
                            >
                                Add to Cart
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 h-11 bg-white border border-[#eadfda] hover:bg-[#fbf8f5] text-secondary-dark text-sm font-bold rounded-full transition"
                            >
                                Cancel
                            </button>
                        </footer>
                    </div>
                )}
            </div>
        </Modal>
    );
}
