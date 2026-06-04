import React from "react";
import { PenBox, Trash2 } from "lucide-react";

export default function TypeCard({ type, onEdit, onDelete }) {
    return (
        <div
            className="rounded-3xl border border-[#eadfda] bg-white p-4 shadow-sm"
            style={{ boxShadow: "0 10px 24px rgba(54, 37, 30, 0.06)" }}
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-primary-text mb-1">
                        {type?.title}
                    </h3>
                    <p className="mb-0 text-sm text-secondary-dark">Type item</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => onEdit(type)}
                        className="border-0 bg-transparent p-0 text-infoColor"
                        aria-label="Edit type"
                    >
                        <PenBox size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(type)}
                        className="border-0 bg-transparent p-0 text-danger"
                        aria-label="Delete type"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
