import React from "react";
import Modal from "@/Components/Modal";
import Badge from "@/Components/ui/Badge";
import { X } from "lucide-react";

export default function OrderDetailModal({ order, show, onClose }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: val % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    const getStatusBadge = (status) => {
        const lowerStatus = status?.toLowerCase();
        const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
        switch (lowerStatus) {
            case 'preparing':
                return <Badge variant="warning">{label}</Badge>;
            case 'pending':
                return <Badge variant="warning">{label}</Badge>;
            case 'ready':
                return <Badge variant="success">{label}</Badge>;
            case 'completed':
            case 'served':
                return <Badge variant="success">{label}</Badge>;
            case 'cancelled':
                return <Badge variant="danger">{label}</Badge>;
            default:
                return <Badge variant="default">{label}</Badge>;
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6 bg-white border border-[#eadfda] rounded-[22px] shadow-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#eadfda]">
                    <div>
                        <h2 className="text-xl font-bold text-[#2f1a16]">
                            Order Details
                        </h2>
                        <p className="text-sm text-secondary-dark mt-1 font-semibold">
                            {order?.order_number}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#6f4f47] hover:text-[#4a2b25] transition border-none appearance-none outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Meta info grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-[#fcf8f6] p-4 rounded-xl border border-[#eadfda] text-sm text-[#4a2b25]">
                    <div>
                        <p className="text-xs text-[#8a6a55] font-semibold">Order Method</p>
                        <p className="font-bold text-[#2f1a16]">
                            {order?.order_method === "qr_order" ? "QR Order" : "Walk-in Order"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[#8a6a55] font-semibold">Payment Method</p>
                        <p className="font-bold text-[#2f1a16]">
                            {order?.payment_method === "khqr" ? "KHQR" : "Cash"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[#8a6a55] font-semibold">Customer Name</p>
                        <p className="font-bold text-[#2f1a16]">
                            {order?.customer_name || "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[#8a6a55] font-semibold">Table Number</p>
                        <p className="font-bold text-[#2f1a16]">
                            {order?.table_number ? `Table ${order.table_number}` : "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[#8a6a55] font-semibold">Status</p>
                        <div className="mt-1">
                            {order && getStatusBadge(order.status)}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-[#8a6a55] font-semibold">Order Date</p>
                        <p className="font-bold text-[#2f1a16]">
                            {order?.order_date ? new Date(order.order_date).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : "N/A"}
                        </p>
                    </div>
                </div>

                {/* Items List */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#6f4f47] mb-3">
                        Items Ordered
                    </h3>
                    <div className="divide-y divide-[#eadfda] border-t border-b border-[#eadfda]">
                        {order?.items?.map((item, idx) => (
                            <div key={idx} className="py-3 flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="font-bold text-[#2f1a16] text-sm">
                                        {item?.product?.name}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {item?.size && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f3ede9] text-[#6f4f47]">
                                                Size: {item.size}
                                            </span>
                                        )}
                                        {item?.type && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fcf8f6] text-[#8a6a55] border border-[#eadfda]">
                                                {item.type}
                                            </span>
                                        )}
                                        {item?.options?.map((opt, optIdx) => (
                                            <span key={optIdx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fcf8f6] text-[#8a6a55] border border-[#eadfda]">
                                                {opt.option_label}: {opt.value_label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    <p className="text-xs text-secondary-dark font-medium">
                                        {item.quantity} x {formatCurrency(Number(item.unit_price))}
                                    </p>
                                    <p className="font-bold text-[#2f1a16] text-sm mt-0.5">
                                        {formatCurrency(Number(item.line_total ?? item.subtotal ?? 0))}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                {order?.notes && (
                    <div className="mb-6 bg-[#fcf8f6] p-3 rounded-lg border border-[#eadfda]">
                        <p className="text-xs text-[#8a6a55] font-semibold uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-sm text-[#4a2b25] italic">"{order.notes}"</p>
                    </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-[#eadfda]">
                    <span className="text-base font-bold text-[#6f4f47]">Total Amount</span>
                    <span className="text-xl font-extrabold text-[#2f1a16]">
                        {formatCurrency(Number(order?.total_amount ?? 0))}
                    </span>
                </div>
            </div>
        </Modal>
    );
}
