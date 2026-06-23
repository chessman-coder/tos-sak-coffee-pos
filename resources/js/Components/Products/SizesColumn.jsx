import React, { useRef, useState, useEffect } from "react";
import SizeBadge from "./SizeBadge";

export default function SizesColumn({ sizes = [] }) {
    const containerRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(sizes.length);

    // Reset visibility to show all sizes when sizes change or container resizes
    useEffect(() => {
        setVisibleCount(sizes.length);

        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            setVisibleCount(sizes.length);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [sizes]);

    // Measure and truncate if they wrap to more than 2 rows
    useEffect(() => {
        if (!containerRef.current || sizes.length === 0) return;
        if (visibleCount !== sizes.length) return;

        const container = containerRef.current;
        const children = Array.from(container.children);
        
        const uniqueOffsets = [];
        let limitIndex = -1;

        for (let i = 0; i < children.length; i++) {
            const offsetTop = children[i].offsetTop;
            if (!uniqueOffsets.includes(offsetTop)) {
                uniqueOffsets.push(offsetTop);
            }
            if (uniqueOffsets.length > 2) {
                limitIndex = i;
                break;
            }
        }

        if (limitIndex !== -1) {
            // Truncate to avoid 3rd row, reserving space for the "+N more" badge
            setVisibleCount(Math.max(1, limitIndex - 1));
        }
    }, [sizes, visibleCount]);

    const displaySizes = sizes.length > 0 ? sizes : ["Reg"];
    const hasMore = visibleCount < displaySizes.length;
    const moreCount = displaySizes.length - visibleCount;

    return (
        <div ref={containerRef} className="flex flex-wrap gap-1 max-w-[220px] overflow-hidden align-middle">
            {displaySizes.slice(0, visibleCount).map((size, idx) => (
                <SizeBadge key={size + "-" + idx} size={size} />
            ))}
            {hasMore && (
                <span className="more-badge inline-flex items-center justify-center rounded-full bg-[#fcf8f6] border border-[#eadfda] px-2 py-0.5 text-[10px] font-bold text-[#8a5b3e]">
                    +{moreCount} more
                </span>
            )}
        </div>
    );
}
