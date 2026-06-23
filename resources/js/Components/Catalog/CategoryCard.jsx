import { Pencil, Trash2, FolderTree, ChevronRight, PenBox } from "lucide-react";

export default function CategoryCard({ category, subItems = [], onDelete, onEdit }) {
    return (
        <div
            className="h-full rounded-3xl p-4"
            style={{
                background: "#fff",
                border: "1px solid #eadfda",
                boxShadow: "0 8px 24px rgba(63, 40, 35, 0.06)",
            }}
        >
            <div className="mb-3 flex items-start justify-between">
                <h3 className="mb-1 text-4xl font-semibold text-primary-text">
                    {category.name}
                </h3>
                <div className="flex gap-4">
                    <button
                        type="button"
                        className="bg-transparent text-infoColor border-none appearance-none outline-none"
                        title="Edit"
                        onClick={() => onEdit?.(category)}
                    >
                        <PenBox size={18} />
                    </button>
                    <button
                        type="button"
                        className="bg-transparent text-danger border-none appearance-none outline-none"
                        title="Delete"
                        onClick={() => onDelete?.(category)}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <p className="mb-2" style={{ color: "#7b5f58", fontSize: "1rem" }}>
                {subItems.length} sub-categories
            </p>

            <div className="flex flex-col gap-1">
                {subItems.map((subCategory) => (
                    <div
                        key={subCategory.id}
                        className="flex items-center text-sm text-secondary-dark"
                    >
                        <ChevronRight size={16} className="mr-2" />
                        <span>{subCategory.name}</span>
                    </div>
                ))}
                {subItems.length === 0 && (
                    <span style={{ color: "#9d8881" }}>
                        No sub-categories yet
                    </span>
                )}
            </div>
        </div>
    );
}
