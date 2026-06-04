import { Plus, Search } from "lucide-react";

export default function InventoryHeader({
    title = "Inventory Management",
    // searchValue = "",
    // onSearchChange,
}) {
    return (
        <div className="mb-6 px-4 pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="relative block w-full m-0 sm:w-80">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            // value={searchValue}
                            // onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder="Search items"
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-amber-100"
                        />
                    </label>

                    <button
                        type="button"
                        // onClick={() => onCreateClick?.()}
                        className="flex items-center justify-center gap-2 rounded-xl bg-secondary-dark px-4 py-2.5 text-sm font-medium text-primary-dark shadow hover:bg-secondary-dark/80"
                    >
                        <Plus strokeWidth={2.5} size={18} />
                        <span>Add Item</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
