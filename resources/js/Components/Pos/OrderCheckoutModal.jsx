import React from "react";
import Modal from "@/Components/Modal";
import { Banknote, QrCode } from "lucide-react";

const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function OrderCheckoutModal({
    isOpen,
    onClose,
    processing,
    errors = {},
    data = {},
    setData,
    cart = [],
    subtotal,
    discountTotal,
    totalAmount,
    onPaymentSelect,
    paymentMethodSelected,
}) {
    return (
        <Modal
            show={isOpen}
            onClose={() => !processing && onClose()}
            maxWidth="md"
        >
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#eadfda]">
                {/* Header */}
                <div className="bg-[#fbf8f5] border-b border-[#eadfda] px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-extrabold text-[#2f1a16]">Confirm Order</h3>
                        <p className="text-xs font-semibold text-secondary-dark">Order Number: {data.order_number}</p>
                    </div>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onClose}
                        className="text-secondary-dark hover:text-[#5a3630] transition text-xl font-bold disabled:opacity-50 cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Validation Errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
                            <strong>Error completing checkout:</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-secondary-dark uppercase tracking-wider">Order Items</h4>
                        <div className="divide-y divide-[#f3ede9]">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-start py-2.5 text-sm first:pt-0 last:pb-0">
                                    <div className="min-w-0 flex-1 pr-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-[#5a3630]">{item.quantity}x</span>
                                            <span className="font-bold text-[#2f1a16] truncate">{item.product.name}</span>
                                        </div>

                                        {/* Chosen options tags */}
                                        {(item.size || item.type || item.selected_options.length > 0) && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.size && (
                                                    <span className="text-[9px] bg-[#eee4de] border border-[#eadfda] text-[#5a3630] px-1.5 py-0.5 rounded font-bold">
                                                        Size: {item.size}
                                                    </span>
                                                )}
                                                {item.type && (
                                                    <span className="text-[9px] bg-white border border-[#eadfda] text-secondary-dark px-1.5 py-0.5 rounded font-semibold">
                                                        Type: {item.type}
                                                    </span>
                                                )}
                                                {item.selected_options.map((opt) => (
                                                    <span
                                                        key={opt.product_option_value_id}
                                                        className="text-[9px] bg-white border border-[#eadfda] text-secondary-dark px-1.5 py-0.5 rounded font-semibold"
                                                    >
                                                        {opt.option_label}: {opt.value_label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="font-bold text-[#2f1a16]">
                                            ${formatPrice((item.price * item.quantity) * (1 - (Number(item.discount || 0) / 100)))}
                                        </div>
                                        <div className="text-[10px] text-secondary-dark mt-0.5">
                                            ${formatPrice(item.price)} each
                                            {Number(item.discount || 0) > 0 && ` (-${item.discount}%)`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="border-[#eadfda]" />

                    {/* Notes Options */}
                    <div className="space-y-3">
                        {data.notes && (
                            <div className="text-base">
                                <span className="font-bold text-secondary-dark">Notes: </span>
                                <span className="text-primary-dark font-medium">{data.notes}</span>
                            </div>
                        )}
                    </div>

                    <hr className="border-[#eadfda]" />

                    {/* Pricing Breakdowns */}
                    <div className="space-y-1.5 bg-[#fcf9f7] p-3.5 rounded-xl border border-[#eadfda]">
                        <div className="flex justify-between text-xs text-secondary-dark font-semibold">
                            <span>Subtotal</span>
                            <span>${formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-secondary-dark font-semibold">
                            <span>Line Discount</span>
                            <span>-${formatPrice(discountTotal)}</span>
                        </div>
                        <div className="flex justify-between text-base font-extrabold text-[#2f1a16] pt-2 border-t border-dashed border-[#eadfda]">
                            <span>Payable Total</span>
                            <span className="text-[#5a3630]">${formatPrice(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#fbf8f5] border-t border-[#eadfda] px-6 py-4 flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => onPaymentSelect("cash")}
                            className="h-12 bg-primary-dark hover:bg-primary-light disabled:bg-card/50 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Banknote size={20} />
                            {processing && paymentMethodSelected === 'cash' ? "Placing..." : "Cash"}
                        </button>

                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => onPaymentSelect("khqr")}
                            className="h-12 bg-primary-dark hover:bg-primary-light disabled:bg-card/50 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <QrCode size={20} />
                            {processing && paymentMethodSelected === 'khqr' ? "Placing..." : "KHQR"}
                        </button>
                    </div>

                    <button
                        type="button"
                        disabled={processing}
                        onClick={onClose}
                        className="w-full h-10 border border-[#eadfda] hover:bg-[#fbf8f5] text-secondary-dark rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    >
                        Cancel & Back to Cart
                    </button>
                </div>
            </div>
        </Modal>
    );
}
