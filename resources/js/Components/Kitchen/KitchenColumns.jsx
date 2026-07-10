import React from "react";
import { Clock, XCircle, AlertCircle } from "lucide-react";

export default function KitchenColumns({
    loading,
    error,
    columns,
    activeMobileTab,
    fetchOrders,
    handleStatusUpdate,
    getElapsedMinutes,
}) {
    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-secondary-dark bg-white rounded-3xl border border-[#EADFC8]/40 shadow-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-dark border-t-transparent mb-4"></div>
                <span className="text-xs font-semibold">Loading kitchen queue...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-[#EADFC8]/40 p-6 shadow-sm">
                <AlertCircle className="text-danger mb-3" size={40} />
                <p className="text-sm font-bold text-[#2F1A16]">{error}</p>
                <button
                    onClick={() => fetchOrders(true)}
                    className="mt-4 px-5 py-2 bg-primary-dark text-white text-xs font-bold rounded-xl hover:bg-[#4B2E2B]"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
            {Object.entries(columns).map(([key, col]) => (
                <div
                    key={key}
                    className={`rounded-3xl border border-[#EADFC8]/40 overflow-hidden flex flex-col shadow-sm ${col.color} ${activeMobileTab === key ? "flex" : "hidden md:flex"}`}
                >
                    {/* Column Header */}
                    <div className="px-4 py-3 border-b border-[#EADFC8]/30 bg-white flex items-center justify-between shrink-0">
                        <h3 className={`font-black text-sm uppercase tracking-wider ${col.titleColor}`}>
                            {col.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${col.badgeColor}`}>
                            {col.orders.length}
                        </span>
                    </div>

                    {/* Order Cards list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {col.orders.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center py-20 text-secondary-dark/60">
                                <p className="text-xs italic">No orders in this stage</p>
                            </div>
                        ) : (
                            col.orders.map(order => {
                                const elapsed = getElapsedMinutes(order.created_at);
                                const isLate = elapsed >= 10 && (key === "pending" || key === "preparing");

                                return (
                                    <div
                                        key={order.id}
                                        className={`bg-white rounded-2xl border p-4 shadow-sm relative flex flex-col justify-between ${isLate ? "border-red-400 ring-2 ring-red-100" : "border-[#EADFC8]/50"
                                            }`}
                                    >
                                        {/* Header */}
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-2.5">
                                                <div>
                                                    <h4 className="font-black text-base text-primary-dark">
                                                        #{order.order_number}
                                                    </h4>
                                                    <span className="text-sm font-bold text-secondary-dark uppercase block tracking-wide">
                                                        {order.customer_name || "Walk-in Customer"}
                                                    </span>
                                                    {order.phone_number && (
                                                        <span className="text-sm font-semibold text-secondary-dark block tracking-wide mt-0.5">
                                                            Phone: {order.phone_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${isLate ? "bg-red-100 text-red-500" : "bg-[#F8F5F2] text-secondary-dark"
                                                        }`}>
                                                        <Clock size={10} />
                                                        {elapsed}m ago
                                                    </span>
                                                    {order.order_type === "QR" && (
                                                        <span className="text-[8px] font-black bg-[#E6B98C] text-primary-dark px-1.5 py-0.5 rounded mt-1.5 tracking-wider uppercase">
                                                            QR SELF
                                                        </span>
                                                    )}
                                                    {order.order_type === "Take Away" && (
                                                        <span className="text-[8px] font-black bg-[#e05a47] text-white px-1.5 py-0.5 rounded mt-1.5 tracking-wider uppercase">
                                                            TAKE AWAY
                                                        </span>
                                                    )}
                                                    {order.order_type === "Dine In" && (
                                                        <span className="text-[8px] font-black bg-[#5a3630] text-white px-1.5 py-0.5 rounded mt-1.5 tracking-wider uppercase">
                                                            DINE IN
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div className="border-t border-[#EADFC8]/20 py-2.5 space-y-2.5">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="text-xs">
                                                        <div className="flex items-start gap-1.5 text-base">
                                                            <span className="font-extrabold text-primary-dark">{item.quantity}x</span>
                                                            <span className="font-bold text-[#2F1A16]">{item.product_name}</span>
                                                        </div>
                                                        {item.options.length > 0 && (
                                                            <div className="text-xs text-secondary-dark font-medium leading-relaxed pl-5 mt-0.5 bg-[#F8F5F2]/50 py-1.5 px-2 rounded-lg border border-[#EADFC8]/10 space-y-0.5">
                                                                {item.options.map((o, idx) => (
                                                                    <div key={idx} className="block">
                                                                        {o.option_label}: <span className="font-black text-primary-dark">{o.value_label}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Notes */}
                                            {order.notes && (
                                                <div className="bg-[#FFF6D2] border border-[#FFF6D2] rounded-xl p-2.5 text-xs text-[#C38B59] mb-3.5 flex items-start gap-1.5">
                                                    <span className="font-bold uppercase text-[9px] mt-0.5 bg-[#EC9303] text-white px-1.5 py-0.5 rounded shrink-0">
                                                        Note
                                                    </span>
                                                    <p className="italic font-medium leading-normal">
                                                        "{order.notes}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="border-t border-[#EADFC8]/20 pt-3 mt-1 flex gap-2">
                                            <div className="flex-1">
                                                {col.nextAction(order.id)}
                                            </div>

                                            {/* Cancel option for pending/preparing */}
                                            {(key === "pending" || key === "preparing") && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Are you sure you want to cancel this order?")) {
                                                            handleStatusUpdate(order.id, "cancelled");
                                                        }
                                                    }}
                                                    className="px-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition"
                                                    aria-label="Cancel Order"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
