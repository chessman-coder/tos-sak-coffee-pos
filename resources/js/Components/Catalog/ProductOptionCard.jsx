import { PenBox, Trash2 } from "lucide-react";
import React from "react";

export default function ProductOptionCard({ option, onEdit, onDelete }) {
    return (
        <div
            className="rounded-3xl border border-[#eadfda] bg-white p-4 shadow-sm"
            style={{ boxShadow: "0 10px 24px rgba(54, 37, 30, 0.06)" }}
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-primary-text mb-0">{option?.name}</h3>
                        {option?.is_required ? (
                            <span className="rounded-full border border-[#e7d7c8] bg-[#faf2e8] px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#9a6b45]">
                                Required
                            </span>
                        ) : null}
                    </div>
                    <p className="mb-0 text-sm text-secondary-dark">{option?.values?.length ?? 0} values</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit?.(option)}
                        className="border-0 bg-transparent p-0 text-infoColor"
                        aria-label="Edit option"
                    >
                        <PenBox size={18}/>
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete?.(option)}
                        className="border-0 bg-transparent p-0 text-danger"
                        aria-label="Delete option"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {(option.values ?? []).map((value) => (
                    <span
                        key={value.id}
                        className="inline-flex items-center rounded-full px-3 py-2"
                        style={{
                            background: "#ede3dd",
                            color: "#4d2e28",
                            fontWeight: 600,
                        }}
                    >
                        {value.value}
                        {Number(value.upcharge) > 0 ? (
                            <span className="ml-2 text-xs font-semibold text-[#9a6b45]">+${Number(value.upcharge).toFixed(2)}</span>
                        ) : null}
                    </span>
                ))}
            </div>
        </div>
    );
}
