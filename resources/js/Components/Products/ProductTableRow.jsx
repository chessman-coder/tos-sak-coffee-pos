import React from "react";
import { Eye, ImageIcon, PenBox, Trash2 } from "lucide-react";
import SizesColumn from "./SizesColumn";
import TypesColumn from "./TypesColumn";
import Badge from "../ui/Badge";

const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const getSizes = (product) => {
    if (!product?.size) return [];
    return String(product.size)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
};

const getTypes = (product) => {
    if (!product?.type) return [];
    return String(product.type)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
};

const getStatusBadge = (stock) => {
    if (stock === null || stock === undefined || stock === "") {
        return <Badge variant="success">In Stock</Badge>;
    }

    const count = Number(stock);
    if (count > 3) {
        return <Badge variant="success">In Stock</Badge>;
    } else if (count > 0 && count <= 3) {
        return <Badge variant="warning">Low Stock</Badge>;
    } else {
        return <Badge variant="danger">Out of Stock</Badge>;
    }
};

export default function ProductTableRow({
    product,
    onView,
    onEdit,
    onDelete,
    canView = true,
    canEdit = true,
    canDelete = true,
}) {
    const imageUrl =
        product?.image_url ??
        (product?.image_path ? `/storage/${product.image_path}` : "");
    const sizes = getSizes(product);
    const types = getTypes(product);
    const category = product?.category?.name ?? "Uncategorized";

    return (
        <tr className="border-b border-[#eadfda] last:border-b-0 hover:bg-[#fcf8f6]/50 transition duration-150">
            {/* Product Name & Thumbnail */}
            <td className="px-4 py-2.5 align-middle whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3ede9]">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="text-[#8b6b61]">
                                <ImageIcon size={22} />
                            </div>
                        )}
                    </div>
                    <span className="font-bold text-[#2f1a16] text-sm md:text-base leading-snug">
                        {product.name}
                    </span>
                </div>
            </td>

            {/* Category */}
            <td className="px-4 py-2.5 align-middle whitespace-nowrap text-sm text-[#4a2b25]">
                <span className="font-semibold">{category}</span>
            </td>

            {/* Type */}
            <td className="px-4 py-2.5 align-middle">
                <TypesColumn types={types} />
            </td>

            {/* Base Price */}
            <td className="px-4 py-2.5 align-middle whitespace-nowrap text-sm font-extrabold text-[#2f1a16]">
                ${formatPrice(product.price)}
            </td>

            {/* Sizes */}
            <td className="px-4 py-2.5 align-middle">
                <SizesColumn sizes={sizes} />
            </td>

            {/* Status */}
            <td className="px-4 py-2.5 align-middle whitespace-nowrap">
                {getStatusBadge(product.stock)}
            </td>

            {/* Actions */}
            <td className="px-4 py-2.5 align-middle whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-4">
                    {canView && (
                        <button
                            type="button"
                            onClick={() => onView?.(product)}
                            className="text-primary-dark transition border-none appearance-none outline-none"
                            title="View Product"
                        >
                            <Eye size={18} />
                        </button>
                    )}
                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit?.(product)}
                            className="text-infoColor transition border-none appearance-none outline-none"
                            title="Edit Product"
                        >
                            <PenBox size={18} />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete?.(product)}
                            className="text-danger transition border-none appearance-none outline-none"
                            title="Delete Product"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
