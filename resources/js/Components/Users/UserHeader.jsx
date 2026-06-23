import { Plus, Search } from "lucide-react";
import Button from "../ui/Button";

export default function UserHeader({
    title = "Users List",
    total = 0,
    onCreateClick,
    searchValue = "",
    onSearchChange,
}) {
    return (
        <div className="mb-6 px-4 pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-primary-dark">{title}</h1>
                    <p className="text-sm text-secondary-dark">{total} team members</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="relative block w-full m-0 sm:w-80">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={searchValue}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder="Search users"
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-primary-light"
                        />
                    </label>

                    <Button
                        type="button"
                        variant="fillDark"
                        onClick={() => onCreateClick?.()}
                        className="inline-flex items-center rounded-full px-4 py-2"
                    >
                        <Plus strokeWidth={2.5} size={18} />
                        <span>Add staff</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
