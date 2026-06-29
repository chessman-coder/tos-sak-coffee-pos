import React, { useState } from 'react';

export default function DashboardCharts({ weeklySales, topSelling }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    // Dynamic calculations for the SVG chart
    const maxSales = Math.max(...weeklySales.map(d => d.sales), 1000) * 1.15;

    // SVG Dimensions
    const width = 600;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Map sales data to SVG coordinates
    const points = weeklySales.map((d, i) => {
        const x = paddingLeft + i * (chartWidth / (weeklySales.length - 1));
        const y = height - paddingBottom - (d.sales / maxSales) * chartHeight;
        return { x, y, day: d.day, sales: d.sales };
    });

    // Helper to generate Cubic Bezier path
    const getBezierPath = (pts) => {
        if (pts.length === 0) return '';
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cpX1 = p0.x + (p1.x - p0.x) / 3;
            const cpY1 = p0.y;
            const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
            const cpY2 = p1.y;
            path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
        }
        return path;
    };

    const bezierPath = getBezierPath(points);

    // Area path closed to the bottom of the chart
    const areaPath = points.length > 0
        ? `${bezierPath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
        : '';

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Sales Chart */}
            <div className="lg:col-span-2 bg-white border border-[#EADBC8] rounded-[2rem] p-6 lg:p-8 flex flex-col shadow-[0_8px_30px_rgb(243,237,230,0.5)]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-primary-text">Weekly Sales</h3>
                        <span className="text-secondary-text text-xs">Last 7 days performance</span>
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

                        <defs>
                            {/* Gradient for area fill under the curve */}
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D9A066" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#D9A066" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Area Fill */}
                        {areaPath && (
                            <path d={areaPath} fill="url(#chartGradient)" />
                        )}

                        {/* Line Stroke */}
                        {bezierPath && (
                            <path d={bezierPath} fill="none" stroke="#D9A066" strokeWidth="3" strokeLinecap="round" />
                        )}

                        {/* Data Dots */}
                        {points.map((p, i) => (
                            <g key={i}>
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={hoveredIdx === i ? 6 : 4}
                                    fill="#D9A066"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                    className="transition-all duration-150 cursor-pointer"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                />
                            </g>
                        ))}

                        {/* Interactive vertical hover indicator */}
                        {hoveredIdx !== null && (
                            <line
                                x1={points[hoveredIdx].x}
                                y1={paddingTop}
                                x2={points[hoveredIdx].x}
                                y2={height - paddingBottom}
                                stroke="#D9A066"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                                className="pointer-events-none"
                            />
                        )}
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

                {/* Labels row */}
                <div className="flex justify-between items-center px-10 mt-4">
                    {weeklySales.map((d, i) => (
                        <span key={i} className="text-secondary-text text-[11px] font-bold w-8 text-center">
                            {d.day}
                        </span>
                    ))}
                </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-white border border-[#EADBC8] rounded-[2rem] p-6 lg:p-8 flex flex-col shadow-[0_8px_30px_rgb(243,237,230,0.5)]">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-primary-text">Top Selling</h3>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    {topSelling && topSelling.length > 0 ? (
                        topSelling.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    {/* Rank circle */}
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#FAF6F0] border border-[#EADBC8] text-primary-text text-[13px] font-black">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-primary-text text-sm">{item.name}</div>
                                        <div className="text-secondary-text text-xs">{item.sold} sold</div>
                                    </div>
                                </div>
                                <div className="font-black text-primary-text text-sm">
                                    {formatCurrency(item.revenue)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-secondary-text text-sm font-semibold">No sales recorded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
