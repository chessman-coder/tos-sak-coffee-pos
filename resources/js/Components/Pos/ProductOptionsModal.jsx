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

export default function ProductOptionsModal({
    isOpen,
    onClose,
    product,
    selectedSize,
    setSelectedSize,
    sizes = [],
    tempSelectedOptions = {},
    onOptionSelect,
    optionError,
    onConfirm,
}) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="lg">
            <div className="p-6 bg-white rounded-3xl relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#7b5f58] hover:text-[#2f1a16] transition"
                    aria-label="Close options"
                >
                    <X size={20} />
                </button>

                {product && (
                    <div className="space-y-6">
                        {/* Product Summary */}
                        <header className="flex gap-4 items-center border-b border-[#f3ede9] pb-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#eee4de] overflow-hidden shrink-0 flex items-center justify-center">
                                {product.image_path ? (
                                    <img
                                        src={`/storage/${product.image_path}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ShoppingBag size={24} className="text-[#7b5f58]" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#2f1a16]">
                                    {product.name}
                                </h3>
                                <p className="text-sm font-semibold text-[#c07a49] mt-0.5">
                                    Base Price: ${formatPrice(product.price)}
                                </p>
                            </div>
                        </header>

                        {/* Option selections */}
                        <div className="space-y-5">
                            {/* Size selection */}
                            {getProductSizes(product).length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-[#2f1a16] flex items-center gap-1.5">
                                        Size
                                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                            Required
                                        </span>
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {getProductSizes(product).map((sz) => {
                                            const isSelected = selectedSize === sz;
                                            const sizeObj = sizes.find(s => s.title.toLowerCase() === sz.toLowerCase());
                                            const upcharge = sizeObj ? Number(sizeObj.upcharge || 0) : 0;
                                            return (
                                                <button
                                                    key={sz}
                                                    type="button"
                                                    onClick={() => setSelectedSize(sz)}
                                                    className={`px-4 py-2 text-xs font-bold rounded-full transition shadow-sm border ${isSelected
                                                        ? "bg-[#5a3630] border-[#5a3630] text-white"
                                                        : "bg-white border-[#eadfda] text-[#7b5f58] hover:bg-[#fbf8f5]"
                                                        }`}
                                                >
                                                    <span>{sz}</span>
                                                    {upcharge > 0 && (
                                                        <span className={`ml-1 px-1 rounded text-[10px] ${isSelected ? "text-white/80" : "text-[#c07a49]"
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

                            {product.options.map((opt) => (
                                <div key={opt.id} className="space-y-2">
                                    <h4 className="text-sm font-bold text-[#2f1a16] flex items-center gap-1.5">
                                        {opt.name}
                                        {opt.is_required && (
                                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                                Required
                                            </span>
                                        )}
                                    </h4>

                                    <div className="flex flex-wrap gap-2">
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
                                                        className={`px-4 py-2 text-xs font-bold rounded-full transition shadow-sm border ${isSelected
                                                            ? "bg-[#5a3630] border-[#5a3630] text-white"
                                                            : "bg-white border-[#eadfda] text-[#7b5f58] hover:bg-[#fbf8f5]"
                                                            }`}
                                                    >
                                                        <span>{val.value}</span>
                                                        {Number(val.upcharge) > 0 && (
                                                            <span className={`ml-1 px-1 rounded text-[10px] ${isSelected ? "text-white/80" : "text-[#c07a49]"
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
                                className="px-6 h-11 bg-white border border-[#eadfda] hover:bg-[#fbf8f5] text-[#7b5f58] text-sm font-bold rounded-full transition"
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
