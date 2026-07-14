import React, { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { DollarSign, ShoppingBag, TrendingUp, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import StatCard from '../../Components/ui/StatCard';
import { toast } from '../../Components/ui/Toast';

export default function SaleAnalytics({ filters, metrics, topSellingByQty, topSellingByRev, chartData }) {
    const [date, setDate] = useState(filters.date);
    const [period, setPeriod] = useState(filters.period);
    const [isSending, setIsSending] = useState(false);
    const [hoveredIdx, setHoveredIdx] = useState(null);

    // Helpers
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(val);
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        // Keep the current date, but let controller parse it accordingly
        router.get(route('sale-analytics.index'), { date, period: newPeriod }, { preserveState: true });
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        router.get(route('sale-analytics.index'), { date: newDate, period }, { preserveState: true });
    };

    const handleYearChange = (e) => {
        const year = e.target.value;
        const newDate = `${year}-01-01`;
        setDate(newDate);
        router.get(route('sale-analytics.index'), { date: newDate, period }, { preserveState: true });
    };

    const triggerTelegramReport = async () => {
        setIsSending(true);
        try {
            const response = await axios.post(route('sale-analytics.send-telegram'), { date, period });
            toast.success(response.data.message);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to send Telegram report. Check configurations.';
            toast.failed(errorMsg);
        } finally {
            setIsSending(false);
        }
    };

    // SVG Chart Calculations
    const maxSales = Math.max(...chartData.map(d => d.sales), 1000) * 1.15;
    const width = 600;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const step = chartWidth / chartData.length;
    // Calculate dynamic bar width depending on number of items (month chart has 31 items)
    const barWidth = period === 'month' ? Math.max(4, Math.floor(step * 0.6)) : 28;

    const points = chartData.map((d, i) => {
        const x = paddingLeft + i * step + (step - barWidth) / 2;
        const yBaseline = height - paddingBottom;
        const barHeight = (d.sales / maxSales) * chartHeight;
        const y = yBaseline - barHeight;
        return {
            x: x + barWidth / 2,
            barX: x,
            y,
            barHeight,
            label: d.label,
            sales: d.sales,
            isCurrent: d.isCurrent
        };
    });

    const getBarPath = (x, y, w, h, rx = 4) => {
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

    // Calculate dynamic years array (current year - 5 to current year + 1)
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

    return (
        <AdminLayout breadcrumb={null}>
            <Head title="Sales Analytics" />

            <div className="mx-auto space-y-8 pb-12 bg-background px-4 py-6 md:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#EADBC8] rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(243,237,230,0.5)]">
                    <div>
                        <h1 className="text-3xl font-black text-primary-text">Sales Analytics</h1>
                        <p className="text-secondary-text text-sm">Visualize and dispatch performance reports</p>
                    </div>

                    {/* Filter & Trigger Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        
                        {/* Period Selector Buttons */}
                        <div className="flex bg-[#FAF6F0] border border-[#EADBC8] rounded-xl p-1">
                            {['day', 'month', 'year'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePeriodChange(p)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                                        period === p 
                                            ? 'bg-primaryColor text-white shadow-sm' 
                                            : 'text-secondary-text hover:text-primary-text'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {/* Date Picker Picker Input */}
                        <div className="relative">
                            {period === 'day' && (
                                <input
                                    type="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    className="px-3 py-2 border border-[#EADBC8] rounded-xl text-xs font-bold bg-[#FAF6F0] text-primary-text focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                                />
                            )}
                            {period === 'month' && (
                                <input
                                    type="month"
                                    value={date.substring(0, 7)}
                                    onChange={handleDateChange}
                                    className="px-2 py-2 border border-[#EADBC8] rounded-xl text-xs font-bold bg-[#FAF6F0] text-primary-text focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                                />
                            )}
                            {period === 'year' && (
                                <select
                                    value={date.substring(0, 4)}
                                    onChange={handleYearChange}
                                    className="pl-4 py-2 border border-[#EADBC8] rounded-xl text-xs font-bold bg-[#FAF6F0] text-left text-primary-text focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                                >
                                    {yearsList.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Send Telegram Trigger */}
                        <button
                            onClick={triggerTelegramReport}
                            disabled={isSending}
                            className="flex items-center gap-2 bg-secondaryColor hover:bg-secondary-dark disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                        >
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>Send Telegram</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Total Revenue"
                        value={formatCurrency(metrics.total_revenue)}
                        icon={<DollarSign className="w-5 h-5 stroke-[2]" />}
                    />
                    <StatCard
                        label="Total Orders"
                        value={metrics.total_orders}
                        icon={<ShoppingBag className="w-5 h-5 stroke-[2]" />}
                    />
                    <StatCard
                        label="Daily Avg Revenue"
                        value={formatCurrency(metrics.daily_avg_revenue)}
                        icon={<TrendingUp className="w-5 h-5 stroke-[2]" />}
                    />
                </div>

                {/* Chart & Top Selling Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* SVG Chart Comparison */}
                    <div className="lg:col-span-2 bg-white border border-[#EADBC8] rounded-[2rem] p-6 lg:p-8 flex flex-col shadow-[0_8px_30px_rgb(243,237,230,0.5)]">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-primary-text text-capitalize">{period} Performance</h3>
                                <span className="text-secondary-text text-xs">Comparing sales data breakdowns</span>
                            </div>
                        </div>

                        {/* Interactive SVG Chart */}
                        <div className="relative flex-1 min-h-[180px]">
                            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                {/* Grid Lines */}
                                <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#F2ECE4" strokeWidth="1" strokeDasharray="4 4" />
                                <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#F2ECE4" strokeWidth="1" strokeDasharray="4 4" />
                                <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#EADBC8" strokeWidth="1" />

                                {/* Hover Column Highlights */}
                                {hoveredIdx !== null && points[hoveredIdx] && (
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
                                        d={getBarPath(p.barX, p.y, barWidth, p.barHeight, period === 'month' ? 2 : 4)}
                                        fill={p.isCurrent ? '#4B2E2B' : '#D9A066'} // Highlight current period in primaryColor
                                        opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.6}
                                        className="transition-all duration-200 cursor-pointer"
                                        onMouseEnter={() => setHoveredIdx(i)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                    />
                                ))}

                                {/* X-Axis Labels (Filtered for MONTH to prevent overlaps) */}
                                {points.map((p, i) => {
                                    // If period is month, only render label every 3 steps or so to avoid overlap
                                    if (period === 'month' && i % 3 !== 0) return null;
                                    return (
                                        <text
                                            key={i}
                                            x={p.x}
                                            y={height - 8}
                                            textAnchor="middle"
                                            fill="#6B6B6B"
                                            className="text-[10px] font-bold select-none"
                                        >
                                            {p.label}
                                        </text>
                                    );
                                })}

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
                            {hoveredIdx !== null && points[hoveredIdx] && (
                                <div
                                    className="absolute bg-primaryColor text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-all duration-150 -translate-x-1/2 -translate-y-[calc(100%+12px)] z-10"
                                    style={{
                                        left: `${(points[hoveredIdx].x / width) * 100}%`,
                                        top: `${(points[hoveredIdx].y / height) * 100}%`
                                    }}
                                >
                                    <div className="font-semibold text-center">{points[hoveredIdx].label}</div>
                                    <div className="text-[10px] text-[#FAF6F0] font-bold mt-0.5">{formatCurrency(points[hoveredIdx].sales)}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Selling Lists */}
                    <div className="bg-white border border-[#EADBC8] rounded-[2rem] p-6 lg:p-8 flex flex-col shadow-[0_8px_30px_rgb(243,237,230,0.5)] gap-6">
                        
                        {/* Top Selling By Quantity */}
                        <div>
                            <h3 className="text-lg font-black text-primary-text mb-4">Top Products (by Qty)</h3>
                            <div className="space-y-4">
                                {topSellingByQty && topSellingByQty.length > 0 ? (
                                    topSellingByQty.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#EADBC8] text-primary-text flex items-center justify-center font-black text-xs">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div className="font-bold text-primary-text text-sm truncate max-w-[120px]">{item.name}</div>
                                                    <div className="text-secondary-text text-xs">{item.sold} sold</div>
                                                </div>
                                            </div>
                                            <div className="font-black text-primary-text text-sm">
                                                {formatCurrency(item.revenue)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-secondary-text text-xs font-bold">No records found</div>
                                )}
                            </div>
                        </div>

                        <hr className="border-[#EADBC8]" />

                        {/* Top Selling By Revenue */}
                        <div>
                            <h3 className="text-lg font-black text-primary-text mb-4">Top Products (by Revenue)</h3>
                            <div className="space-y-4">
                                {topSellingByRev && topSellingByRev.length > 0 ? (
                                    topSellingByRev.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#EADBC8] text-primary-text flex items-center justify-center font-black text-xs">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <div className="font-bold text-primary-text text-sm truncate max-w-[120px]">{item.name}</div>
                                                    <div className="text-secondary-text text-xs">{item.sold} sold</div>
                                                </div>
                                            </div>
                                            <div className="font-black text-primary-text text-sm">
                                                {formatCurrency(item.revenue)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-secondary-text text-xs font-bold">No records found</div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}