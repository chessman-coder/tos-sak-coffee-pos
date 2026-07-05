import React from "react";
import { Check, Printer } from "lucide-react";
import { router } from "@inertiajs/react";

export default function SuccessView({
    amount,
    bill_number,
    payment_method = "khqr",
    cash_received = 0,
    change_due = 0,
    onPrintReceipt = null,
    isAdmin = false,
}) {
    const totalAmount = Number(amount || 0);

    const formatPrice = (price) => {
        return Number(price ?? 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="p-8 text-center bg-white space-y-6">
            {/* Animated Success Checkmark */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-success bg-success-bg border-4 border-success animate-pulse">
                <Check size={40} className="stroke-[4]" />
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-primary-text tracking-tight">
                    {payment_method === "cash" ? "Payment Completed!" : "Pay Successfully!"}
                </h2>
                <p className="text-sm font-bold text-success bg-success-bg inline-block px-4 py-1 rounded-full">
                    {payment_method === "cash" ? "Cash Order Paid" : "KHQR Payment Confirmed"}
                </p>
            </div>

            {/* Receipt Summary card */}
            <div className="bg-[#fcf9f7] rounded-2xl p-5 border border-[#eadfda] text-left space-y-3.5 shadow-sm">
                <h3 className="text-xs font-bold text-secondary-dark uppercase tracking-wider">
                    {payment_method === "cash" ? "Transaction Summary" : "Receipt Details"}
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary-dark font-semibold">Order Number</span>
                        <span className="text-[#2f1a16] font-bold">
                            {bill_number || "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-[#f3ede9] pt-2">
                        <span className="text-secondary-dark font-semibold">Total Amount</span>
                        <span className="text-[#2f1a16] font-bold">
                            ${formatPrice(totalAmount)}
                        </span>
                    </div>

                    {payment_method === "cash" && (
                        <>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-secondary-dark font-semibold">Cash Received</span>
                                <span className="text-[#2f1a16] font-bold">
                                    ${formatPrice(cash_received)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-[#f3ede9] pt-2">
                                <span className="text-success font-extrabold">Change Return</span>
                                <span className="text-success font-extrabold text-lg">
                                    ${formatPrice(change_due)}
                                </span>
                            </div>
                        </>
                    )}

                    {payment_method !== "cash" && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-secondary-dark font-semibold">Payment Method</span>
                            <span className="text-[#2f1a16] font-bold">
                                Bakong KHQR
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
                {payment_method === "cash" && onPrintReceipt && (
                    <button
                        type="button"
                        onClick={onPrintReceipt}
                        className="w-full h-12 bg-white hover:bg-[#fbf8f5] text-[#5a3630] border border-[#eadfda] rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                        <Printer size={18} />
                        Print Receipt
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem("pos_cart");
                        localStorage.removeItem("client_order_cart");
                        router.visit(isAdmin ? route("pos.index") : "/");
                    }}
                    className="w-full h-12 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-xl font-bold shadow-md transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    {isAdmin ? "Return to POS" : "Back to Ordering"}
                </button>
            </div>
        </div>
    );
}
