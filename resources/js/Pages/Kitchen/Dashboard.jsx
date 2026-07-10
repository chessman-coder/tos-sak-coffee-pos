import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { Coffee, Check, Play, CheckCircle } from "lucide-react";
import KitchenHeader from "@/Components/Kitchen/KitchenHeader";
import KitchenColumns from "@/Components/Kitchen/KitchenColumns";

export default function KitchenDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [activeMobileTab, setActiveMobileTab] = useState("pending");
    const prevOrdersCountRef = useRef(0);
    const audioCtxRef = useRef(null);

    const getAudioContext = () => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtxRef.current.state === "suspended") {
                audioCtxRef.current.resume().catch(() => { });
            }
            return audioCtxRef.current;
        } catch (e) {
            console.log("AudioContext creation failed:", e);
            return null;
        }
    };

    // Unlock Audio Context on first user gesture
    useEffect(() => {
        const unlockAudio = () => {
            getAudioContext();
            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("touchstart", unlockAudio);
        };
        document.addEventListener("click", unlockAudio);
        document.addEventListener("touchstart", unlockAudio);
        return () => {
            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("touchstart", unlockAudio);
        };
    }, []);

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
            const audioCtx = getAudioContext();
            if (!audioCtx || audioCtx.state === "suspended") {
                console.log("AudioContext is suspended (requires user gesture). Chime skipped.");
                return;
            }

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
                    className="w-full py-2.5 rounded-xl bg-primary-dark hover:bg-[#4B2E2B] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
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

            <div className="flex flex-col h-[calc(100vh-80px)] px-3 py-3 md:px-4 md:py-4 bg-[#F8F5F2]">
                {/* Header controls */}
                <KitchenHeader
                    soundEnabled={soundEnabled}
                    setSoundEnabled={setSoundEnabled}
                    pendingCount={columns.pending.orders.length}
                    preparingCount={columns.preparing.orders.length}
                    readyCount={columns.ready.orders.length}
                />

                {/* Mobile Tabs Navigation Bar */}
                <div className="flex md:hidden items-center justify-between mb-3 bg-white p-1.5 rounded-2xl border border-[#EADFC8]/40 shadow-sm shrink-0">
                    {Object.entries(columns).map(([key, col]) => {
                        const isActive = activeMobileTab === key;
                        const labelColor = key === 'pending' ? 'text-danger' : key === 'preparing' ? 'text-warning' : 'text-success';
                        const bgColor = key === 'pending' ? 'bg-danger-bg' : key === 'preparing' ? 'bg-warning-bg' : 'bg-success-bg';
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveMobileTab(key)}
                                className={`flex-1 py-2 px-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 ${isActive
                                        ? `${bgColor} ${labelColor}`
                                        : "text-secondary-dark hover:bg-[#F8F5F2]"
                                    }`}
                            >
                                <span>{col.title.replace(" Orders", "")}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white font-black' : 'bg-[#F8F5F2]'
                                    }`}>
                                    {col.orders.length}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Dashboard Columns */}
                <KitchenColumns
                    loading={loading}
                    error={error}
                    columns={columns}
                    activeMobileTab={activeMobileTab}
                    fetchOrders={fetchOrders}
                    handleStatusUpdate={handleStatusUpdate}
                    getElapsedMinutes={getElapsedMinutes}
                />
            </div>
        </AdminLayout>
    );
}
