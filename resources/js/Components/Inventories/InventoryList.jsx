import { Plus, Minus, Eye, SquarePen, Trash2, ImageIcon } from "lucide-react";
import Badge from "../ui/Badge";

export default function InventoryList({
    filteredItems,
    formatCurrency,
    formatValue,
    openMovementModal,
    onViewItem,
    onEditItem,
    onDeleteItem,
}) {
    if (!filteredItems || filteredItems.length === 0) {
        return (
            <div className="overflow-hidden rounded-[22px] border border-[#eadfda] bg-white p-6 text-sm text-secondary-dark shadow-[0_10px_24px_rgba(54,37,30,0.04)]">
                No inventory items match your search.
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-[22px] border border-[#eadfda] bg-white shadow-[0_10px_24px_rgba(54,37,30,0.04)]">
            <table className="min-w-full divide-y divide-[#eadfda] text-left">
                <thead>
                    <tr className="bg-[#fcf8f6]">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle w-[6%]">No.</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">Item</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle w-[10%]">Stock</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle w-[12%]">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle w-[12%]">Reorder ≤</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle w-[10%]">Cost</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle w-[10%]">Value</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle text-right w-[12%]">Actions</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#eadfda]">
                    {filteredItems.map((item, index) => {
                        const isLow = item.stock > 0 && item.stock <= item.reorderLevel;
                        const isOut = item.stock === 0;

                        return (
                            <tr key={item.id} className="border-b border-[#eadfda] last:border-b-0 hover:bg-[#fcf8f6]/50 transition duration-150">
                                <td className="px-6 py-4 align-middle whitespace-nowrap text-sm text-[#4a2b25]">
                                    {String(index + 1).padStart(2, "0")}
                                </td>

                                <td className="px-6 py-4 align-middle whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-[#eadfda] bg-[#fbf8f6]">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-[#8b6d64]">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#2f1a16] text-sm">{item.name}</div>
                                            <div className="text-xs text-[#8b6d64] font-medium">{item.category} · {item.supplier}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 align-middle whitespace-nowrap text-sm font-semibold text-[#4a2b25]">
                                    {item.stock} {item.unit}
                                </td>

                                <td className="px-6 py-4 align-middle whitespace-nowrap">
                                    <Badge variant={isOut ? "danger" : isLow ? "warning" : "success"}>
                                        {isOut ? "Out" : isLow ? "Low" : "In stock"}
                                    </Badge>
                                </td>

                                <td className="px-6 py-4 align-middle whitespace-nowrap text-sm font-semibold text-[#4a2b25]">
                                    {item.reorderLevel} {item.unit}
                                </td>

                                <td className="px-6 py-4 align-middle whitespace-nowrap text-sm font-semibold text-[#4a2b25]">
                                    {formatCurrency(item.unitCost)}
                                </td>

                                <td className="px-6 py-4 align-middle whitespace-nowrap text-sm font-extrabold text-[#2f1a16]">
                                    {formatValue(item)}
                                </td>

                                <td className="px-6 py-4 align-middle whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button type="button" onClick={() => openMovementModal(item, "in")} className="text-success transition border-none appearance-none outline-none" aria-label="Stock in" title="Add Stock">
                                            <Plus size={18} strokeWidth={2.5} />
                                        </button>
                                        <button type="button" onClick={() => openMovementModal(item, "out")} className="text-warning transition border-none appearance-none outline-none" aria-label="Stock out" title="Remove Stock">
                                            <Minus size={18} strokeWidth={2.5} />
                                        </button>
                                        <button type="button" onClick={() => onViewItem(item)} className="text-primary-dark transition border-none appearance-none outline-none" aria-label="View details" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        <button type="button" onClick={() => onEditItem(item)} className="text-infoColor transition border-none appearance-none outline-none" aria-label="Edit item" title="Edit Item">
                                            <SquarePen size={18} />
                                        </button>
                                        <button type="button" onClick={() => onDeleteItem(item)} className="text-danger transition border-none appearance-none outline-none" aria-label="Delete item" title="Delete Item">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
