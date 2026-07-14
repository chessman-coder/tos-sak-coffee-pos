import React, { useState } from 'react';

export default function DashboardCharts({ weeklySales }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    // Dynamic calculations for the SVG chart
    const maxSales = Math.max(...weeklySales.map(d => d.sales), 1000) * 1.15;

    // SVG Dimensions
    const width = 600;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 30; // Increased padding to fit X-axis labels within SVG

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const barWidth = 28;
    const step = chartWidth / weeklySales.length;

    // Map sales data to SVG coordinates
    const points = weeklySales.map((d, i) => {
        const x = paddingLeft + i * step + (step - barWidth) / 2;
        const yBaseline = height - paddingBottom;
        const barHeight = (d.sales / maxSales) * chartHeight;
        const y = yBaseline - barHeight;
        return {
            x: x + barWidth / 2, // Center of the bar for tooltips
            barX: x,
            y,
            barHeight,
            day: d.day,
            sales: d.sales
        };
    });

    // Helper to generate a path with rounded top corners only
    const getBarPath = (x, y, w, h, rx = 6) => {
        const yBaseline = height - paddingBottom;
        const currentRx = Math.max(0, Math.min(rx, h));
        return `M ${x} ${yBaseline}
                L ${x} ${y + currentRx}
                Q ${x} ${y} ${x + currentRx} ${y}
                L ${x + w - currentRx} ${y}
                Q ${x + w} ${y} ${x + w} ${y + currentRx}
                L ${x + w} ${yBaseline}
                Z`;
    };

    // Formatter helpers
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: val % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    return (
        <div className="lg:col-span-2 bg-white border border-[#EADBC8] rounded-[2rem] p-6 lg:p-8 flex flex-col shadow-[0_8px_30px_rgb(243,237,230,0.5)]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-primary-text">Weekly Sales</h3>
                    <span className="text-secondary-text text-xs">This Week Performance</span>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-[#FAF6F0] border border-[#EADBC8] text-primary-text text-[11px] font-bold">
                    This week
                </span>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative flex-1 min-h-[180px]">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#F2ECE4" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#F2ECE4" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#EADBC8" strokeWidth="1" />

                    {/* Hover Column Highlights */}
                    {hoveredIdx !== null && (
                        <rect
                            x={points[hoveredIdx].barX - (step - barWidth) / 2}
                            y={paddingTop}
                            width={step}
                            height={chartHeight}
                            fill="#D9A066"
                            opacity="0.06"
                            className="pointer-events-none"
                        />
                    )}

                    {/* Render Bars */}
                    {points.map((p, i) => (
                        <path
                            key={i}
                            d={getBarPath(p.barX, p.y, barWidth, p.barHeight, 6)}
                            fill="#D9A066"
                            opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.6}
                            className="transition-all duration-200 cursor-pointer"
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        />
                    ))}

                    {/* X-Axis Labels */}
                    {points.map((p, i) => (
                        <text
                            key={i}
                            x={p.x}
                            y={height - 8}
                            textAnchor="middle"
                            fill="#6B6B6B"
                            className="text-[11px] font-bold select-none"
                        >
                            {p.day}
                        </text>
                    ))}

                    {/* Interactive transparent hover detection zones */}
                    {points.map((p, i) => (
                        <rect
                            key={i}
                            x={p.barX - (step - barWidth) / 2}
                            y={paddingTop}
                            width={step}
                            height={chartHeight}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        />
                    ))}
                </svg>

                {/* Chart Tooltips */}
                {hoveredIdx !== null && (
                    <div
                        className="absolute bg-primaryColor text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-all duration-150 -translate-x-1/2 -translate-y-[calc(100%+12px)]"
                        style={{
                            left: `${(points[hoveredIdx].x / width) * 100}%`,
                            top: `${(points[hoveredIdx].y / height) * 100}%`
                        }}
                    >
                        <div className="font-semibold">{points[hoveredIdx].day}</div>
                        <div className="text-[10px] text-[#FAF6F0]">{formatCurrency(points[hoveredIdx].sales)}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
