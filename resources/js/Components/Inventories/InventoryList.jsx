import { Plus, Minus, Eye, SquarePen, Trash2 } from "lucide-react";
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
            <div className="overflow-hidden rounded-[28px] border border-[#eadfda] bg-white p-6 text-sm text-secondary-dark">
                No inventory items match your search.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[28px] border border-[#eadfda] bg-white">
            <table className="w-full table-auto text-sm text-[#5f4038]">
                <thead className="bg-[#fbf8f6] text-xs font-semibold uppercase tracking-[0.08em] text-[#8b6d64]">
                    <tr>
                        <th className="px-4 py-3 text-left w-[6%]">No.</th>
                        <th className="px-4 py-3 text-left">Item</th>
                        <th className="px-4 py-3 text-left w-[10%]">Stock</th>
                        <th className="px-4 py-3 text-left w-[12%]">Status</th>
                        <th className="px-4 py-3 text-left w-[12%]">Reorder ≤</th>
                        <th className="px-4 py-3 text-left w-[10%]">Cost</th>
                        <th className="px-4 py-3 text-left w-[10%]">Value</th>
                        <th className="px-4 py-3 text-right w-[12%]">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-[#eadfda]">
                    {filteredItems.map((item, index) => {
                        const isLow = item.stock > 0 && item.stock <= item.reorderLevel;
                        const isOut = item.stock === 0;

                        return (
                            <tr key={item.id} className="odd:bg-white even:bg-[#fffaf8]">
                                <td className="px-4 py-4 text-xs font-semibold text-[#8b6d64]">{String(index + 1).padStart(2, "0")}</td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-[#eadfda] bg-[#fbf8f6]">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#2f1a16]">{item.name}</div>
                                            <div className="text-xs text-[#8b6d64]">{item.category} · {item.supplier}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <div className="font-semibold">{item.stock} {item.unit}</div>
                                </td>

                                <td className="px-4 py-4">
                                    <Badge variant={isOut ? "danger" : isLow ? "warning" : "success"}>
                                        {isOut ? "Out" : isLow ? "Low" : "In stock"}
                                    </Badge>
                                </td>

                                <td className="px-4 py-4 font-semibold">{item.reorderLevel} {item.unit}</td>

                                <td className="px-4 py-4 font-semibold">{formatCurrency(item.unitCost)}</td>

                                <td className="px-4 py-4 font-semibold">{formatValue(item)}</td>

                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button type="button" onClick={() => openMovementModal(item, "in")} className="text-success transition border-none appearance-none outline-none" aria-label="Stock in">
                                            <Plus size={18} strokeWidth={2.5} />
                                        </button>
                                        <button type="button" onClick={() => openMovementModal(item, "out")} className="text-warning  transition border-none appearance-none outline-none" aria-label="Stock out">
                                            <Minus size={18} strokeWidth={2.5} />
                                        </button>
                                        <button type="button" onClick={() => onViewItem(item)} className="text-primary-light transition border-none appearance-none outline-none" aria-label="View details">
                                            <Eye size={18} />
                                        </button>
                                        <button type="button" onClick={() => onEditItem(item)} className="text-infoColor transition border-none appearance-none outline-none" aria-label="Edit item">
                                            <SquarePen size={18} />
                                        </button>
                                        <button type="button" onClick={() => onDeleteItem(item)} className="text-danger transition border-none appearance-none outline-none" aria-label="Delete item">
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
