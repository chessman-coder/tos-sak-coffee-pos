import React from "react";

export default function SizeBadge({ size }) {
    if (!size) return null;

    return (
        <span className="inline-flex items-center justify-center rounded-full bg-[#eee4de] px-2.5 py-1 text-[11px] font-semibold text-secondary-dark transition duration-150 hover:bg-[#e1d0c8]">
            {size}
        </span>
    );
}
