import { PenBox, Pencil, Trash2 } from "lucide-react";

export default function SizeCard({ size, onEdit, onDelete }) {
    const letter = (size?.title || "").charAt(0).toUpperCase();
    const upcharge = size?.upcharge ?? size?.price ?? size?.amount ?? 0;

    return (
        <div
            className="h-full rounded-3xl p-6"
            style={{
                background: "#fff",
                border: "1px solid #eadfda",
                boxShadow: "0 8px 24px rgba(63, 40, 35, 0.06)",
            }}
        >
            <div className="flex flex-col items-center mb-4">
                <div
                    className="flex items-center justify-center mb-3"
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "#efe7e4",
                        color: "#3E2522",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                    }}
                >
                    {letter}
                </div>

                <div className="text-lg font-semibold text-primary-text">
                    {size?.title}
                </div>
                <div className="text-sm text-secondary-dark mt-1">
                    {Number(upcharge) > 0 ? `+$${Number(upcharge).toFixed(2)}` : "No upcharge"}
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
                <button
                    type="button"
                    className="border-0 bg-transparent p-0 text-infoColor"
                    title="Edit"
                    onClick={() => onEdit?.(size)}
                >
                    <PenBox size={18} />
                </button>
                <button
                    type="button"
                    className="border-0 bg-transparent p-0 text-danger"
                    title="Delete"
                    onClick={() => onDelete?.(size)}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
