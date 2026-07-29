import React from "react";
import { Check, Printer } from "lucide-react";
import { router } from "@inertiajs/react";
import ReceiptTemplate from "@/Components/ReceiptTemplate";

export default function SuccessView({
    amount,
    bill_number,
    order = null,
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

    const waitingNumber = order?.waiting_number ?? (() => {
        const source = String(order?.order_number || bill_number || "");
        const digits = source.match(/\d+/g)?.join("");
        return digits ? digits.replace(/^0+/, "") || "0" : source || "N/A";
    })();

    const orderType = order?.order_type || "N/A";
    const isDineIn = orderType.toLowerCase().includes("dine");

    const itemsList = Array.isArray(order?.items)
        ? order.items
        : order?.items
        ? [order.items]
        : [];
    const itemsCount = itemsList.reduce(
        (sum, item) => sum + Number(item.quantity || 1),
        0
    );
    const itemsNamesLabel =
        itemsList
            .map((item) => item?.product?.name || item?.product_name || item?.name)
            .filter(Boolean)
            .join(", ") || "N/A";

    const isPOSView = isAdmin && order?.order_method !== "self_order";

    return (
        <div className="p-8 text-center bg-white space-y-6">
            {/* Animated Success Checkmark */}
            <div className="no-print mx-auto flex h-20 w-20 items-center justify-center rounded-full text-success bg-success-bg border-4 border-success animate-pulse">
                <Check size={40} className="stroke-[4]" />
            </div>

            <div className="no-print space-y-2">
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
                            {bill_number || order?.order_number || "N/A"}
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary-dark font-semibold">Waiting Number</span>
                        <span className="text-[#5a3630] font-black text-sm bg-[#f3ede9] px-2.5 py-0.5 rounded-lg">
                            #{waitingNumber}
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary-dark font-semibold">Order Type</span>
                        <span className="text-[#2f1a16] font-bold">
                            {orderType}
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary-dark font-semibold">Customer Name</span>
                        <span className="text-[#2f1a16] font-bold">
                            {order?.customer_name || "N/A"}
                        </span>
                    </div>

                    {!isDineIn && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-secondary-dark font-semibold">Customer Number</span>
                            <span className="text-[#2f1a16] font-bold">
                                {order?.phone_number || order?.customer_number || "N/A"}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-sm gap-4 border-t border-[#f3ede9] pt-2">
                        <span className="text-secondary-dark font-semibold shrink-0">Order Item</span>
                        <span className="text-[#2f1a16] font-bold text-right truncate">
                            {itemsNamesLabel} {itemsCount > 0 ? `(x${itemsCount})` : ""}
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

            <ReceiptTemplate
                amount={amount}
                bill_number={bill_number}
                order={order}
                payment_method={payment_method}
                cash_received={cash_received}
                change_due={change_due}
            />

            {/* Actions */}
            <div className="space-y-3 pt-2">
                {isPOSView ? (
                    <button
                        type="button"
                        onClick={onPrintReceipt}
                        className="w-full h-12 bg-white hover:bg-[#fbf8f5] text-[#5a3630] border border-[#eadfda] rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                        <Printer size={18} />
                        Print Receipt
                    </button>
                ) : (
                    <div className="p-3.5 bg-[#fcf9f7] border border-[#c07a49]/40 rounded-xl text-center text-xs font-black text-[#ff0000]">
                        Please, screenshot the order receipt to track your order!
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem("pos_cart");
                        localStorage.removeItem("client_order_cart");
                        router.visit(isPOSView ? route("pos.index") : "/");
                    }}
                    className="w-full h-12 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-xl font-bold shadow-md transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    {isPOSView ? "Return to POS" : "Back to Ordering"}
                </button>
            </div>
        </div>
    );
}
