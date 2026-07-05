import React from "react";
import { Plus, ClipboardList, ImageIcon } from "lucide-react";

// Format Price Utility
const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};


export default function ProductGrid({ filteredProducts = [], handleAddToCartClick }) {
    return (
        <div className="w-full">
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((prod) => {
                        const imageUrl = prod.image_url ?? (prod.image_path ? `/storage/${prod.image_path}` : "");
                        const categoryName = prod.category?.name ?? "Special";
                        const hasStock = prod.stock !== null && prod.stock !== undefined && prod.stock !== "";
                        const isOutOfStock = hasStock && Number(prod.stock) <= 0;

                        return (
                            <article
                                key={prod.id}
                                onClick={() => !isOutOfStock && handleAddToCartClick(prod)}
                                className={`group overflow-hidden rounded-[24px] border border-[#eadfda] bg-white shadow-sm hover:shadow-md transition duration-200 cursor-pointer flex flex-col relative ${isOutOfStock ? "opacity-60 cursor-not-allowed" : "active:scale-98"
                                    }`}
                            >
                                {/* Visual representation: Top half with warm background */}
                                <div className="h-32 sm:h-40 flex items-center justify-center bg-[#f3ede9] relative overflow-hidden transition group-hover:scale-[1.02]">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={prod.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-3 text-center w-full h-full">
                                            <ImageIcon size={18} />
                                        </div>
                                    )}

                                    {/* Out of Stock Ribbon */}
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="bg-[#5a3630] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                                Sold Out
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info: Bottom half with white background */}
                                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#c07a49] mb-1">
                                            {categoryName}
                                        </p>
                                        <h3 className="text-sm font-bold text-[#2f1a16] line-clamp-2 leading-snug group-hover:text-[#5a3630]">
                                            {prod.name}
                                        </h3>
                                    </div>
                                    <div className="mt-2.5 flex items-center justify-between gap-1.5">
                                        <span className="text-base font-black text-[#5a3630]">
                                            ${formatPrice(prod.price)}
                                        </span>
                                        {!isOutOfStock && (
                                            <div className="h-7 w-7 rounded-full bg-[#f3ede9] text-[#5a3630] flex items-center justify-center group-hover:bg-[#5a3630] group-hover:text-white transition duration-200">
                                                <Plus size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[28px] border border-[#eadfda] shadow-sm">
                    <ClipboardList size={48} className="text-[#c07a49] mb-3" />
                    <h3 className="text-lg font-bold text-[#2f1a16]">
                        No items match search
                    </h3>
                    <p className="text-sm text-[#8b6b61] mt-1 text-center max-w-xs px-4">
                        Try selecting another category or check your spelling.
                    </p>
                </div>
            )}
        </div>
    );
}
