import React, { useRef, useState, useEffect } from "react";
import TypesBadge from "./TypesBadge";

export default function TypesColumn({ types = [] }) {
    const containerRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(types.length);

    // Reset visibility to show all types when types change or container resizes
    useEffect(() => {
        setVisibleCount(types.length);

        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            setVisibleCount(types.length);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [types]);

    // Measure and truncate if they wrap to more than 2 rows
    useEffect(() => {
        if (!containerRef.current || types.length === 0) return;
        if (visibleCount !== types.length) return;

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
    }, [types, visibleCount]);

    const displayTypes = types.length > 0 ? types : [];
    const hasMore = visibleCount < displayTypes.length;
    const moreCount = displayTypes.length - visibleCount;

    return (
        <div ref={containerRef} className="flex flex-wrap gap-1 max-w-[220px] overflow-hidden align-middle">
            {displayTypes.slice(0, visibleCount).map((type, idx) => (
                <TypesBadge key={type + "-" + idx} type={type} />
            ))}
            {hasMore && (
                <span className="more-badge inline-flex items-center justify-center rounded-full bg-[#fcf8f6] border border-[#eadfda] px-2 py-0.5 text-[10px] font-bold text-[#8a5b3e]">
                    +{moreCount} more
                </span>
            )}
        </div>
    );
}
