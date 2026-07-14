import React from "react";
import { usePage } from "@inertiajs/react";

export default function ReceiptTemplate({
    amount,
    bill_number,
    order = null,
    payment_method = "khqr",
    cash_received = 0,
    change_due = 0,
}) {
    const { settings } = usePage().props;

    const formatPrice = (price) => {
        return Number(price ?? 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const receiptItems = order?.items ?? [];
    const receiptSubtotal = receiptItems.reduce(
        (sum, item) => sum + Number(item.subtotal ?? 0),
        0,
    );
    const receiptDiscount = receiptItems.reduce(
        (sum, item) => sum + Number(item.discount ?? 0),
        0,
    );
    const receiptTotal = Number(order?.total_amount ?? amount ?? 0);
    const paymentMethodLabel = payment_method === "cash" ? "Cash" : "KHQR";
    const orderDateValue = order?.created_at || order?.order_date || null;
    const orderDateTime = orderDateValue
        ? new Date(orderDateValue).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "N/A";
    const waitingNumber = order?.waiting_number ?? (() => {
        const source = String(order?.order_number || bill_number || "");
        const digits = source.match(/\d+/g)?.join("");
        return digits ? digits.replace(/^0+/, "") || "0" : source || "N/A";
    })();
    const discountPercent =
        receiptSubtotal > 0 ? (receiptDiscount / receiptSubtotal) * 100 : 0;

    const renderItemOptions = (item) => {
        const options = item.options || [];
        if (options.length === 0) return null;

        return options.map((option) => (
            <div
                key={
                    option.id || `${option.option_label}-${option.value_label}`
                }
                className="text-[10px] leading-tight text-[#8a6d65]"
            >
                {option.option_label}: {option.value_label}
            </div>
        ));
    };

    return (
        <div className="receipt-print-area mx-auto w-full max-w-[360px] rounded-3xl border border-[#eadfda] bg-white p-5 text-left shadow-sm space-y-4">
            <style>{`
                .receipt-print-area {
                    display: none !important;
                }
                @media print {
                    /* Hide all screen elements */
                    body * {
                        visibility: hidden !important;
                    }
                    
                    /* Show only the receipt and its children */
                    .receipt-print-area,
                    .receipt-print-area * {
                        visibility: visible !important;
                    }
                    
                    /* Reset all parent container layouts to prevent vertical/horizontal centering, scale transforms, and overflow clipping */
                    html, body, #modal, [role="dialog"], [data-portal], .fixed, .absolute {
                        position: static !important;
                        display: block !important;
                        width: auto !important;
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-shadow: none !important;
                        background: transparent !important;
                        overflow: visible !important;
                    }
                    
                    /* Position receipt at the top-left of the print canvas */
                    .receipt-print-area {
                        display: block !important;
                        width: 80mm !important;
                        margin: auto !important;
                        padding: 20px !important;
                        border: 1px black solid !important;
                        box-shadow: none !important;
                        background: white !important;
                        box-sizing: border-box !important;
                        overflow: visible !important;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                }
            `}</style>

            <div className="text-center space-y-2 border-b border-dashed border-[#eadfda] pb-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[#eadfda] bg-white">
                    <img
                        src={settings?.logo_url || "/images/logo.svg"}
                        alt="Logo"
                        className="h-12 w-12 object-contain"
                    />
                </div>
                <div>
                    <h1 className="text-lg font-black text-secondary-dark">{settings?.store_name || "TOS SAK COFFEE"}</h1>
                    <h3 className="text-lg font-black tracking-[0.2em] text-[#2f1a16] uppercase">
                        Receipt
                    </h3>
                    <p className="text-[11px] font-semibold text-secondary-dark">
                        {paymentMethodLabel} Payment
                    </p>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                    <span className="font-semibold text-secondary-dark">
                        Date
                    </span>
                    <span className="text-right font-bold text-[#2f1a16]">
                        {orderDateTime}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="font-semibold text-secondary-dark">
                        Payment Method
                    </span>
                    <span className="text-right font-bold text-[#2f1a16]">
                        {paymentMethodLabel}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="font-semibold text-secondary-dark">
                        Order Number
                    </span>
                    <span className="text-right font-bold text-[#2f1a16]">
                        {bill_number || "N/A"}
                    </span>
                </div>
            </div>

            <div className="space-y-3 border-t border-dashed border-[#eadfda] pt-4">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-secondary-dark">
                    <span>Item</span>
                    <span>Subtotal</span>
                </div>
                <div className="space-y-3">
                    {receiptItems.length > 0 ? (
                        receiptItems.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="space-y-1.5 border-b border-[#f5eeea] pb-3 last:border-b-0 last:pb-0"
                            >
                                <div className="flex justify-between gap-3 text-sm">
                                    <div className="min-w-0">
                                        <p className="font-bold text-[#2f1a16] break-words">
                                            {item.quantity || 0}x{" "}{item.product?.name ||
                                                item.product_name ||
                                                `Item ${index + 1}`}
                                        </p>
                                        <p className="text-[11px] text-secondary-dark">
                                            {item.size
                                                ? ` Size ${item.size}`
                                                : ""}
                                            {item.type ? ` • ${item.type}` : ""}
                                        </p>
                                        {renderItemOptions(item)}
                                    </div>
                                    <div className="shrink-0 text-right font-bold text-[#2f1a16]">
                                        ${formatPrice(item.subtotal ?? 0)}
                                    </div>
                                </div>
                                {Number(item.discount ?? 0) > 0 && (
                                    <div className="flex justify-between text-[11px] text-secondary-dark">
                                        <span>Discount</span>
                                        <span>
                                            - ${formatPrice(item.discount)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-secondary-dark">
                            No items available.
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2 border-t border-dashed border-[#eadfda] pt-4 text-sm">
                <div className="flex justify-between gap-4">
                    <span className="font-semibold text-secondary-dark">
                        Subtotal
                    </span>
                    <span className="font-bold text-[#2f1a16]">
                        ${formatPrice(receiptSubtotal)}
                    </span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="font-semibold text-secondary-dark">
                        Discount
                    </span>
                    <span className="font-bold text-[#2f1a16]">
                        {receiptDiscount > 0
                            ? `${discountPercent.toFixed(2)}%`
                            : "0%"}
                    </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-[#f5eeea] pt-2 text-base">
                    <span className="font-black text-[#2f1a16]">
                        Total Amount
                    </span>
                    <span className="font-black text-[#5a3630]">
                        ${formatPrice(receiptTotal)}
                    </span>
                </div>
            </div>

            <div className="rounded-2xl bg-[#fcf9f7] px-4 py-3 text-center border border-[#eadfda]">
                <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-secondary-dark">
                    Waiting Number
                </div>
                <div className="mt-1 text-3xl font-black tracking-[0.2em] text-[#5a3630]">
                    {waitingNumber}
                </div>
            </div>

            {payment_method === "cash" && (
                <div className="space-y-2 border-t border-dashed border-[#eadfda] pt-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-secondary-dark font-semibold">
                            Cash Received
                        </span>
                        <span className="text-[#2f1a16] font-bold">
                            ${formatPrice(cash_received)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-secondary-dark font-semibold">
                            Change Return
                        </span>
                        <span className="text-success font-extrabold">
                            ${formatPrice(change_due)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
