import React from "react";

export default function TypesBadge({ type }) {
    if (!type) return null;

    return (
        <span className="inline-flex items-center justify-center rounded-full bg-[#f5ebe6] px-2.5 py-1 text-[11px] font-semibold text-[#8a5b3e] border border-[#e8ded8] transition duration-150 hover:bg-[#e8ded8]">
            {type}
        </span>
    );
}
