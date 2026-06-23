import React from "react";
import Modal from "@/Components/Modal";
import { ImageIcon, X } from "lucide-react";
import { usePage } from "@inertiajs/react";

const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function ProductViewModal({ show, product, onClose }) {
    if (!show || !product) return null;

    const imageUrl = product.image_url ?? (product.image_path ? `/storage/${product.image_path}` : "");
    const category = product.category?.name ?? "Uncategorized";
    const type = product.type ?? "-";
    const sizes = product.size ? String(product.size).split(",").map(s => s.trim()).join(", ") : "Reg";
    const stockValue = product.stock === null || product.stock === undefined || product.stock === "" ? "Unlimited" : product.stock;
    const user = usePage().props.auth.user;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md" backdropClassName="bg-black/60">
            <div className="rounded-[28px] border border-[#eadfda] bg-[#faf6f2] p-6 shadow-[0_20px_50px_rgba(54,37,30,0.15)] relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-3xl font-semibold text-primary-text tracking-wide">
                        {product.name}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e1d0c8] bg-white text-[#7b5f58] transition hover:bg-[#fcf8f6] hover:text-[#5a3630]"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Big Image Container */}
                <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[#f5eee9] to-[#ebdcd0] border border-[#e8ded8] p-4">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain max-h-[160px]"
                        />
                    ) : (
                        <div className="text-[#8b6b61] flex flex-col items-center gap-2">
                            <ImageIcon size={48} className="stroke-[1.5]" />
                            <span className="text-xs font-semibold text-[#8a6a55]">No Image Available</span>
                        </div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Category */}
                    <div className="bg-[#f5eee9]/70 rounded-[18px] p-3.5 border border-[#eedfda]/50">
                        <span className="block text-[10px] font-bold text-[#8a6a55] tracking-wider uppercase">
                            Category
                        </span>
                        <span className="block text-sm md:text-base font-bold text-[#2f1a16] mt-0.5">
                            {category}
                        </span>
                    </div>

                    {/* Type */}
                    <div className="bg-[#f5eee9]/70 rounded-[18px] p-3.5 border border-[#eedfda]/50">
                        <span className="block text-[10px] font-bold text-[#8a6a55] tracking-wider uppercase">
                            Type
                        </span>
                        <span className="block text-sm md:text-base font-bold text-[#2f1a16] mt-0.5">
                            {type}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="bg-[#f5eee9]/70 rounded-[18px] p-3.5 border border-[#eedfda]/50">
                        <span className="block text-[10px] font-bold text-[#8a6a55] tracking-wider uppercase">
                            Price
                        </span>
                        <span className="block text-sm md:text-base font-bold text-[#2f1a16] mt-0.5">
                            ${formatPrice(product.price)}
                        </span>
                    </div>

                    {/* Stock */}
                    <div className="bg-[#f5eee9]/70 rounded-[18px] p-3.5 border border-[#eedfda]/50">
                        <span className="block text-[10px] font-bold text-[#8a6a55] tracking-wider uppercase">
                            Stock
                        </span>
                        <span className="block text-sm md:text-base font-bold text-[#2f1a16] mt-0.5">
                            {stockValue}
                        </span>
                    </div>

                    {/* Sizes */}
                    <div className="bg-[#f5eee9]/70 rounded-[18px] p-3.5 border border-[#eedfda]/50 col-span-1">
                        <span className="block text-[10px] font-bold text-[#8a6a55] tracking-wider uppercase">
                            Sizes
                        </span>
                        <span className="block text-sm md:text-base font-bold text-[#2f1a16] mt-0.5">
                            {sizes}
                        </span>
                    </div>

                    {/* Sizes */}
                    <div className="bg-[#f5eee9]/70 rounded-[18px] p-3.5 border border-[#eedfda]/50 col-span-1">
                        <span className="block text-[10px] font-bold text-[#8a6a55] tracking-wider uppercase">
                            Create by
                        </span>
                        <span className="block text-sm md:text-base font-bold text-[#2f1a16] mt-0.5">
                            {user?.name}
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
