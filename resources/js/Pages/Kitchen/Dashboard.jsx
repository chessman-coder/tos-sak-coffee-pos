import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
    Clock, Coffee, Check, Play, CheckCircle,
    XCircle, AlertCircle, Volume2, VolumeX
} from "lucide-react";

export default function KitchenDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const prevOrdersCountRef = useRef(0);

    // Fetch active orders
    const fetchOrders = (showLoading = false) => {
        if (showLoading) setLoading(true);
        axios.get("/api/kitchen/orders")
            .then(res => {
                if (res.data.success) {
                    const newOrders = res.data.data;

                    // Check if new order arrived (to play sound)
                    if (newOrders.length > prevOrdersCountRef.current) {
                        const hasNewPending = newOrders.some(order =>
                            order.status === "pending" &&
                            !orders.some(o => o.id === order.id)
                        );
                        if (hasNewPending && soundEnabled) {
                            playChime();
                        }
                    }

                    setOrders(newOrders);
                    prevOrdersCountRef.current = newOrders.length;
                    setError(null);
                } else {
                    setError("Failed to fetch kitchen queue.");
                }
            })
            .catch(err => {
                console.error(err);
                setError("Failed to communicate with kitchen API.");
            })
            .finally(() => {
                if (showLoading) setLoading(false);
            });
    };

    // Initial load and polling fallback (5 seconds)
    useEffect(() => {
        fetchOrders(true);

        const interval = setInterval(() => {
            fetchOrders(false);
        }, 5000);

        // Laravel Echo Real-time Integration
        if (window.Echo) {
            console.log("Subscribing to kitchen channel...");
            const channel = window.Echo.channel("kitchen");

            channel.listen(".order.created", (e) => {
                console.log("Real-time order created in kitchen:", e.order);
                setOrders(prev => {
                    if (prev.some(o => o.id === e.order.id)) return prev;
                    if (soundEnabled) playChime();
                    return [...prev, e.order];
                });
            });

            channel.listen(".order.status_changed", (e) => {
                console.log("Real-time order status updated in kitchen:", e.order);
                setOrders(prev => {
                    const status = e.order.status.toLowerCase();
                    // If completed or cancelled, remove from kitchen dashboard
                    if (status === "completed" || status === "cancelled") {
                        return prev.filter(o => o.id !== e.order.id);
                    }
                    // Otherwise update or insert
                    if (prev.some(o => o.id === e.order.id)) {
                        return prev.map(o => o.id === e.order.id ? e.order : o);
                    }
                    return [...prev, e.order];
                });
            });

            return () => {
                window.Echo.leaveChannel("kitchen");
                clearInterval(interval);
            };
        }

        return () => clearInterval(interval);
    }, [soundEnabled]);

    // Play new order sound alert
    const playChime = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            // Tone sequence (chime sound)
            const playTone = (freq, startTime, duration) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.05);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = audioCtx.currentTime;
            playTone(523.25, now, 0.15);       // C5
            playTone(659.25, now + 0.12, 0.15);  // E5
            playTone(783.99, now + 0.24, 0.3);   // G5
        } catch (e) {
            console.log("Chime play blocked or unsupported:", e);
        }
    };

    // Update order status action
    const handleStatusUpdate = (orderId, newStatus) => {
        axios.post(`/api/kitchen/orders/${orderId}/status`, { status: newStatus })
            .then(res => {
                if (res.data.success) {
                    setOrders(prev => {
                        if (newStatus === "completed" || newStatus === "cancelled") {
                            return prev.filter(o => o.id !== orderId);
                        }
                        return prev.map(o => o.id === orderId ? res.data.data : o);
                    });
                }
            })
            .catch(err => {
                console.error(err);
                alert("Failed to update status.");
            });
    };

    // Time elapsed calculation
    const getElapsedMinutes = (createdAtStr) => {
        const diff = Date.now() - new Date(createdAtStr).getTime();
        return Math.floor(diff / 60000);
    };

    // Columns grouping
    const columns = {
        pending: {
            title: "Pending Orders",
            color: "border-[#FF002C]/30 bg-[#FFCED2]/10",
            titleColor: "text-[#FF002C]",
            badgeColor: "bg-[#FFCED2] text-[#FF002C]",
            orders: orders.filter(o => o.status === "pending"),
            nextAction: (orderId) => (
                <button
                    onClick={() => handleStatusUpdate(orderId, "preparing")}
                    className="w-full py-2.5 rounded-xl bg-[#5A3A36] hover:bg-[#4B2E2B] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                    <Play size={14} />
                    Start Preparing
                </button>
            )
        },
        preparing: {
            title: "Preparing",
            color: "border-[#EC9303]/30 bg-[#FFF6D2]/10",
            titleColor: "text-[#EC9303]",
            badgeColor: "bg-[#FFF6D2] text-[#EC9303]",
            orders: orders.filter(o => o.status === "preparing"),
            nextAction: (orderId) => (
                <button
                    onClick={() => handleStatusUpdate(orderId, "ready")}
                    className="w-full py-2.5 rounded-xl bg-[#D9A066] hover:bg-[#C38B59] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                    <CheckCircle size={14} />
                    Mark as Ready
                </button>
            )
        },
        ready: {
            title: "Ready for Pickup",
            color: "border-[#00D991]/30 bg-[#B3FFD8]/10",
            titleColor: "text-[#00D991]",
            badgeColor: "bg-[#B3FFD8] text-[#00D991]",
            orders: orders.filter(o => o.status === "ready"),
            nextAction: (orderId) => (
                <button
                    onClick={() => handleStatusUpdate(orderId, "completed")}
                    className="w-full py-2.5 rounded-xl bg-[#00D991] hover:bg-[#00B87A] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                    <Check size={14} />
                    Complete / Served
                </button>
            )
        }
    };

    return (
        <AdminLayout>
            <Head title="Kitchen Queue Dashboard" />

            <div className="flex flex-col h-[calc(100vh-80px)] px-4 py-4 bg-[#F8F5F2]">
                {/* Header controls */}
                <div className="flex items-center justify-between mb-4 shrink-0 bg-white p-3.5 rounded-2xl border border-[#EADFC8]/40 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-[#4B2E2B] flex items-center gap-2">
                            <Coffee size={24} className="text-[#C38B59]" />
                            Kitchen Dashboard
                        </h1>
                        <p className="text-xs text-secondary-dark mt-0.5">
                            Manage and track active orders in the prep queue.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Audio alert toggle */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`flex h-10 px-4 items-center gap-2 rounded-xl border text-xs font-bold transition ${soundEnabled
                                    ? "bg-[#FDFBF9] border-[#EADFC8] text-[#5A3A36]"
                                    : "bg-red-50 border-red-200 text-red-500"
                                }`}
                        >
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            <span>{soundEnabled ? "Chime On" : "Chime Off"}</span>
                        </button>

                        {/* Status Stats Summary */}
                        <div className="flex items-center gap-2 text-xs font-bold bg-[#F8F5F2] px-3.5 py-2 rounded-xl border border-[#EADFC8]/30">
                            <span className="text-[#FF002C]">Pending: {columns.pending.orders.length}</span>
                            <span className="text-[#EADFC8] mx-1">|</span>
                            <span className="text-[#EC9303]">Prep: {columns.preparing.orders.length}</span>
                            <span className="text-[#EADFC8] mx-1">|</span>
                            <span className="text-[#00D991]">Ready: {columns.ready.orders.length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Columns */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-secondary-dark bg-white rounded-3xl border border-[#EADFC8]/40 shadow-sm">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5A3A36] border-t-transparent mb-4"></div>
                        <span className="text-xs font-semibold">Loading kitchen queue...</span>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-[#EADFC8]/40 p-6 shadow-sm">
                        <AlertCircle className="text-[#FF002C] mb-3" size={40} />
                        <p className="text-sm font-bold text-[#2F1A16]">{error}</p>
                        <button
                            onClick={() => fetchOrders(true)}
                            className="mt-4 px-5 py-2 bg-[#5A3A36] text-white text-xs font-bold rounded-xl hover:bg-[#4B2E2B]"
                        >
                            Retry Loading
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                        {Object.entries(columns).map(([key, col]) => (
                            <div
                                key={key}
                                className={`rounded-3xl border border-[#EADFC8]/40 overflow-hidden flex flex-col shadow-sm ${col.color}`}
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
                                                                <h4 className="font-extrabold text-sm text-[#2F1A16]">
                                                                    #{order.order_number}
                                                                </h4>
                                                                <span className="text-[10px] font-bold text-[#C38B59] uppercase block tracking-wide">
                                                                    {order.customer_name || "Walk-in Customer"}
                                                                </span>
                                                                {order.phone_number && (
                                                                    <span className="text-[10px] font-semibold text-[#c07a49] block tracking-wide mt-0.5">
                                                                        Phone: {order.phone_number}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end shrink-0">
                                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${isLate ? "bg-red-100 text-red-500" : "bg-[#F8F5F2] text-secondary-dark"
                                                                    }`}>
                                                                    <Clock size={10} />
                                                                    {elapsed}m ago
                                                                </span>
                                                                {order.order_type === "QR" && (
                                                                    <span className="text-[8px] font-black bg-[#E6B98C] text-[#5A3A36] px-1.5 py-0.5 rounded mt-1.5 tracking-wider uppercase">
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
                                                                    <div className="flex items-start gap-1.5">
                                                                        <span className="font-extrabold text-[#5A3A36]">{item.quantity}x</span>
                                                                        <span className="font-bold text-[#2F1A16]">{item.product_name}</span>
                                                                    </div>
                                                                    {item.options.length > 0 && (
                                                                        <p className="text-[10px] text-secondary-dark font-medium leading-relaxed pl-5 mt-0.5 bg-[#F8F5F2]/50 py-1 px-2 rounded-lg border border-[#EADFC8]/10">
                                                                            {item.options.map(o => `${o.option_label}: ${o.value_label}`).join(", ")}
                                                                        </p>
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
                )}
            </div>
        </AdminLayout>
    );
}
