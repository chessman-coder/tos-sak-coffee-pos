import React from "react";
import { AlertCircle, X, Plus } from "lucide-react";

// Format Price Utility
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

export default function ProductOptionsModal({
    isOpen,
    setIsOpen,
    currentProduct,
    tempSelectedOptions,
    tempSelectedOptionsNotes = {},
    setTempSelectedOptionsNotes,
    selectedSize,
    setSelectedSize,
    selectedType,
    setSelectedType,
    optionError,
    sizes = [],
    handleOptionSelect,
    handleConfirmOptions,
    itemNote,
    setItemNote,
}) {
    if (!isOpen || !currentProduct) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity animate-fadeIn"
            />

            {/* Modal Content */}
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-slideUp font-sans">
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-[#eadfda] flex items-center justify-between sticky top-0 bg-white z-10">
                    <h3 className="font-extrabold text-base text-[#2f1a16] truncate">
                        Customize "{currentProduct.name}"
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 rounded-full bg-[#f3ede9] text-[#5a3630] flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-5 py-4 overflow-y-auto space-y-5">
                    {optionError && (
                        <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 flex items-start gap-2 text-red-600 text-xs font-semibold">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{optionError}</span>
                        </div>
                    )}

                    {/* Sizes Selection */}
                    {getProductSizes(currentProduct).length > 0 && (
                        <div>
                            <label className="text-[11px] font-black uppercase text-[#8b6b61] tracking-wider block mb-2">
                                Select Size <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {getProductSizes(currentProduct).map((szName) => {
                                    const matchingSizeObj = sizes.find(
                                        (s) => s.title.toLowerCase() === szName.toLowerCase()
                                    );
                                    const szUpcharge = matchingSizeObj ? Number(matchingSizeObj.upcharge || 0) : 0;

                                    return (
                                        <button
                                            key={szName}
                                            type="button"
                                            onClick={() => setSelectedSize(szName)}
                                            className={`p-2 border rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${selectedSize === szName
                                                ? "border-[#5a3630] bg-[#fcf9f7] text-[#5a3630] ring-1 ring-[#5a3630]"
                                                : "border-[#eadfda] bg-white text-gray-500 hover:bg-[#fbf8f5]"
                                                }`}
                                        >
                                            <span className="font-extrabold text-xs">{szName}</span>
                                            {szUpcharge > 0 && (
                                                <span className="text-[9px] text-[#c07a49] font-bold mt-0.5">
                                                    +${formatPrice(szUpcharge)}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Types Selection (Hot / Iced / Frappe) */}
                    {getProductTypes(currentProduct).length > 0 && (
                        <div>
                            <label className="text-[11px] font-black uppercase text-[#8b6b61] tracking-wider block mb-2">
                                Select Drink Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {getProductTypes(currentProduct).map((tpName) => (
                                    <button
                                        key={tpName}
                                        type="button"
                                        onClick={() => setSelectedType(tpName)}
                                        className={`p-2 border rounded-xl flex items-center justify-center text-xs font-bold transition cursor-pointer ${selectedType === tpName
                                            ? "border-[#5a3630] bg-[#fcf9f7] text-[#5a3630] ring-1 ring-[#5a3630]"
                                            : "border-[#eadfda] bg-white text-gray-500 hover:bg-[#fbf8f5]"
                                            }`}
                                    >
                                        {tpName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom Options (Sugar, Ice, Add-ons, etc.) */}
                    {currentProduct.options && currentProduct.options.length > 0 && (
                        <div className="space-y-4 pt-2 border-t border-[#eadfda]">
                            {currentProduct.options.map((opt) => (
                                <div key={opt.id} className="space-y-2">
                                    <label className="text-[11px] font-black uppercase text-[#8b6b61] tracking-wider block">
                                        {opt.name} {opt.is_required && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {opt.values?.map((val) => {
                                            const isSelected = tempSelectedOptions[opt.id]?.id === val.id;
                                            const upcharge = Number(val.upcharge || 0);

                                            return (
                                                <button
                                                    key={val.id}
                                                    type="button"
                                                    onClick={() => handleOptionSelect(opt.id, val)}
                                                    className={`py-2 px-3 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${isSelected
                                                        ? "border-[#5a3630] bg-[#fcf9f7] text-[#5a3630] font-bold ring-1 ring-[#5a3630]"
                                                        : "border-[#eadfda] bg-white text-gray-500 hover:bg-[#fbf8f5]"
                                                        }`}
                                                >
                                                    {val.value}
                                                    {upcharge > 0 && (
                                                        <span className="text-[10px] text-[#c07a49] font-bold">
                                                            (+${formatPrice(upcharge)})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {tempSelectedOptions[opt.id] && (
                                        <input
                                            type="text"
                                            value={tempSelectedOptionsNotes[opt.id] || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setTempSelectedOptionsNotes((prev) => ({
                                                    ...prev,
                                                    [opt.id]: val,
                                                }));
                                            }}
                                            placeholder={`Note for ${opt.name} (e.g. less sweet, extra ice)...`}
                                            className="w-full mt-2 px-3 py-1.5 text-xs rounded-xl border border-[#eadfda] bg-white outline-none focus:border-[#c07a49] transition focus:ring-1 focus:ring-[#f3ede9]"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* General Product Notes */}
                    <div className="pt-4 border-t border-[#eadfda]">
                        <label className="text-[11px] font-black uppercase text-[#8b6b61] tracking-wider block mb-2">
                            Special Instructions for this item
                        </label>
                        <textarea
                            rows={2}
                            value={itemNote}
                            onChange={(e) => setItemNote(e.target.value)}
                            placeholder="e.g. No lid, hot water on the side, etc..."
                            className="w-full p-2.5 text-xs rounded-xl border border-[#eadfda] bg-white outline-none resize-none focus:border-[#c07a49] transition focus:ring-1 focus:ring-[#f3ede9]"
                        />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-[#eadfda] bg-gray-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-[#8b6b61] font-bold tracking-wider">Estimated Price</span>
                        <span className="text-xl font-black text-[#5a3630]">
                            ${formatPrice(
                                Number(currentProduct.price) +
                                Object.values(tempSelectedOptions).reduce((sum, opt) => sum + Number(opt.upcharge || 0), 0) +
                                (selectedSize
                                    ? Number(sizes.find((s) => s.title.toLowerCase() === selectedSize.toLowerCase())?.upcharge || 0)
                                    : 0)
                            )}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleConfirmOptions}
                        className="h-11 px-6 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-xl font-bold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Add to Order
                    </button>
                </div>
            </div>
        </div>
    );
}
