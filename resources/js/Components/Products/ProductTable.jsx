import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ProductTableRow from "./ProductTableRow";

export default function ProductTable({
    products = [],
    canView = true,
    canEdit = true,
    canDelete = true,
    onView,
    onEdit,
    onDelete,
    sortBy = "created_at",
    sortOrder = "desc",
    onSort,
}) {
    const handleSortClick = (field) => {
        if (!onSort) return;
        
        let newOrder = "asc";
        if (sortBy === field) {
            newOrder = sortOrder === "asc" ? "desc" : "asc";
        } else {
            // Set default order for specific columns
            newOrder = field === "created_at" ? "desc" : "asc";
        }
        
        onSort(field, newOrder);
    };

    const renderSortIcon = (field) => {
        if (sortBy !== field) {
            return (
                <div className="flex flex-col px-4 py-3 opacity-30 hover:opacity-100 transition duration-150 ml-1">
                    <ChevronUp size={10} className="-mb-0.5" />
                    <ChevronDown size={10} className="-mt-0.5" />
                </div>
            );
        }
        
        return sortOrder === "asc" ? (
            <ChevronUp size={14} className="ml-1 text-[#5a3630] font-bold" />
        ) : (
            <ChevronDown size={14} className="ml-1 text-[#5a3630] font-bold" />
        );
    };

    const renderHeader = (label, field, sortable = true) => {
        if (!sortable) {
            return (
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">
                    {label}
                </th>
            );
        }

        return (
            <th
                onClick={() => handleSortClick(field)}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] cursor-pointer select-none hover:text-[#5a3630] transition duration-150 align-middle"
            >
                <div className="flex items-center">
                    <span>{label}</span>
                    {renderSortIcon(field)}
                </div>
            </th>
        );
    };

    return (
        <div className="w-full overflow-x-auto rounded-[22px] border border-[#eadfda] bg-white shadow-[0_10px_24px_rgba(54,37,30,0.04)]">
            <table className="min-w-full divide-y divide-[#eadfda] text-left">
                <thead>
                    <tr className="bg-[#fcf8f6]">
                        {renderHeader("Product", "name")}
                        {renderHeader("Category", "category")}
                        {renderHeader("Type", "type")}
                        {renderHeader("Base Price", "price")}
                        {renderHeader("Sizes", "size", false)}
                        {renderHeader("Status", "stock", false)}
                        <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] text-right align-middle">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#eadfda]">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductTableRow
                                key={product.id}
                                product={product}
                                canView={canView}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                onView={onView}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-4 py-10 text-center text-sm font-semibold text-[#8a6a55]">
                                No products found in the catalog.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
