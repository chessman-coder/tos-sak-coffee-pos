import { Eye, ImageIcon, PenBox, Plus, Trash2 } from "lucide-react";

const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const getOptionValues = (product) => {
    if (product?.options?.length) {
        return product.options.flatMap((option) => option.values ?? []);
    }

    return [];
};

const getSizes = (product) => {
    if (!product?.size) return [];

    return String(product.size)
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean);
};

export default function ProductCard({
    product,
    onView,
    onEdit,
    onDelete,
    canView = true,
    canEdit = true,
    canDelete = true,
    onAddToCart, // Added for POS
}) {
    const imageUrl = product?.image_url ?? (product?.image_path ? `/storage/${product.image_path}` : "");
    const sizes = getSizes(product);
    const optionValues = sizes.length > 0 ? sizes : getOptionValues(product).map((value) => value.value);
    const visibleBadges = optionValues.slice(0, 2);
    const remainingCount = Math.max(0, optionValues.length - 2);
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

                <div className="mb-4 flex min-h-6 items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {visibleBadges.length > 0 ? (
                            <>
                                {visibleBadges.map((value) => (
                                    <span
                                        key={value}
                                        className="rounded-full bg-[#eee4de] px-2.5 py-1 text-[11px] font-semibold text-secondary-dark"
                                    >
                                        {value}
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <span
                                        className="rounded-full bg-[#eee4de] px-2.5 py-1 text-[11px] font-semibold text-secondary-dark"
                                    >
                                        +{remainingCount}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="rounded-full bg-[#eee4de] px-2.5 py-1 text-[11px] font-semibold text-secondary-dark">
                                Reg
                            </span>
                        )}
                    </div>
                    {hasStock ? (
                        <span className={`shrink-0 text-xs font-bold ${isOutOfStock ? "text-danger" : "text-success"}`}>
                            {isOutOfStock ? "Out of Stock" : `Stock: ${product.stock}`}
                        </span>
                    ) : null}
                </div>

                {onAddToCart ? (
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
                ) : (
                    <div className="grid grid-cols-[34px_1fr_34px] gap-2">
                        {canView ? (
                            <button
                                type="button"
                                onClick={() => onView?.(product)}
                                className="inline-flex h-9 items-center justify-center rounded-full border border-[#e1d0c8] bg-white text-[#4a2b25] transition hover:bg-[#fcf8f6]"
                                aria-label={`View ${product?.name}`}
                            >
                                <Eye size={16} />
                            </button>
                        ) : (
                            <span />
                        )}

                        {canEdit ? (
                            <button
                                type="button"
                                onClick={() => onEdit?.(product)}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#e1d0c8] bg-[#fbf8f5] px-4 text-sm font-semibold text-[#4a2b25] transition hover:bg-white"
                            >
                                <PenBox size={15} />
                                Edit
                            </button>
                        ) : (
                            <span />
                        )}

                        {canDelete ? (
                            <button
                                type="button"
                                onClick={() => onDelete?.(product)}
                                className="inline-flex h-9 items-center justify-center rounded-full border border-[#e1d0c8] bg-white text-[#4a2b25] transition hover:bg-[#fff3f0]"
                                aria-label={`Delete ${product?.name}`}
                            >
                                <Trash2 size={15} />
                            </button>
                        ) : (
                            <span />
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
