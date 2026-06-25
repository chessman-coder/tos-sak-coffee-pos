import { Eye, ImageIcon, PenBox, Plus, Trash2 } from "lucide-react";

const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function ProductCard({
    product,
    onAddToCart, // Added for POS
}) {
    const imageUrl = product?.image_url ?? (product?.image_path ? `/storage/${product.image_path}` : "");
    const category = product?.category?.name ?? "Uncategorized";
    const hasStock = product?.stock !== null && product?.stock !== undefined && product?.stock !== "";
    const isOutOfStock = hasStock && Number(product?.stock) <= 0;

    return (
        <article className={`overflow-hidden rounded-[22px] border border-[#eadfda] bg-white shadow-[0_10px_24px_rgba(54,37,30,0.06)] transition ${isOutOfStock ? "opacity-75" : ""}`}>
            <div className="flex h-48 items-center justify-center bg-[#f3ede9]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product?.name ?? "Product"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#8b6b61] shadow-sm">
                        <ImageIcon size={30} />
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#c07a49]">
                            {category}
                        </p>
                        <h3 className="mb-0 truncate text-base font-semibold text-[#2f1a16]">
                            {product?.name}
                        </h3>
                    </div>
                    <div className="shrink-0 text-lg font-bold text-[#2f1a16]">
                        ${formatPrice(product?.price)}
                    </div>
                </div>

                {onAddToCart && (
                    <button
                        type="button"
                        onClick={() => !isOutOfStock && onAddToCart?.(product)}
                        disabled={isOutOfStock}
                        className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition ${isOutOfStock
                                ? "bg-[#eadfda] text-secondary-dark cursor-not-allowed opacity-60"
                                : "bg-[#5a3630] text-white hover:bg-[#4a2b25]"
                            }`}
                    >
                        <Plus size={15} />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                )}
            </div>
        </article>
    );
}
