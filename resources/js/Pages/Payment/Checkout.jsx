import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { QrCode, Check } from "lucide-react";
import Modal from "@/Components/Modal";

export default function Checkout({ order_id, qr_code, md5, amount, bill_number, description }) {
    const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, checking, success, error
    const [errorMsg, setErrorMsg] = useState("");
    const [isSimulating, setIsSimulating] = useState(false);
    const [checkingManual, setCheckingManual] = useState(false);

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qr_code)}`;

    const handleClose = () => {
        if (order_id && paymentStatus !== "success") {
            router.delete(route('orders.destroy', order_id));
        } else {
            localStorage.removeItem("pos_cart");
            router.visit(route('pos.index'));
        }
    };

    // Auto-polling for payment status verification
    useEffect(() => {
        if (!order_id || !md5 || paymentStatus === "success") return;

        const checkPayment = async () => {
            try {
                const response = await fetch(route('payment.check', { id: order_id, md5: md5 }));
                const result = await response.json();

                if (result.success) {
                    setPaymentStatus("success");
                    setErrorMsg("");
                }
            } catch (err) {
                console.error("Payment check error:", err);
            }
        };

        // Initial check
        checkPayment();

        // Interval polling every 5 seconds
        const intervalId = setInterval(() => {
            checkPayment();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [order_id, md5, paymentStatus]);

    // Manual status check handler
    const handleCheckStatus = async () => {
        if (!order_id || !md5 || paymentStatus === "success" || checkingManual) return;

        setCheckingManual(true);
        setErrorMsg("");

        try {
            const response = await fetch(route('payment.check', { id: order_id, md5: md5 }));
            const result = await response.json();

            if (result.success) {
                setPaymentStatus("success");
            } else {
                setErrorMsg(result.message || "Payment is still pending. Please try scanning again.");
            }
        } catch (err) {
            console.error("Manual check error:", err);
            setPaymentStatus("error");
            setErrorMsg("Could not connect to the server to verify payment.");
        } finally {
            setCheckingManual(false);
        }
    };

    const headWeb = "QR Payment";

    return (
        <>
            <Head title={headWeb} />
            <Modal
                show={true}
                onClose={handleClose}
                maxWidth="md"
            >
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#eadfda]">
                    {paymentStatus === "success" ? (
                        /* Success View */
                        <div className="p-8 text-center bg-white space-y-6">
                            {/* Animated Success Checkmark */}
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-success bg-success-bg border-4 border-success animate-pulse">
                                <Check size={40} className="stroke-[4]" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold text-primary-text tracking-tight">
                                    Pay Successfully!
                                </h2>
                                <p className="text-sm font-bold text-success bg-success-bg inline-block px-3 py-1 rounded-full">
                                    KHQR Payment Confirmed
                                </p>
                            </div>

                            {/* Receipt Summary card */}
                            <div className="bg-[#fcf9f7] rounded-2xl p-5 border border-[#eadfda] text-left space-y-3.5 shadow-sm">
                                <h3 className="text-xs font-bold text-secondary-dark uppercase tracking-wider">
                                    Receipt Details
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-secondary-dark font-semibold">Order Number</span>
                                        <span className="text-[#2f1a16] font-bold">
                                            {bill_number || "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-secondary-dark font-semibold">Amount Paid</span>
                                        <span className="text-[#2f1a16] font-extrabold text-base">
                                            ${Number(amount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-secondary-dark font-semibold">Payment Method</span>
                                        <span className="text-[#2f1a16] font-bold">
                                            Bakong KHQR
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Redirect Timer info */}
                            <div className="space-y-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        localStorage.removeItem("pos_cart");
                                        router.visit(route('pos.index'));
                                    }}
                                    className="w-full h-12 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-xl font-bold shadow-md transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                >
                                    Return to POS
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Scan & Verification View */
                        <>
                            {/* Header */}
                            <div className="bg-[#fbf8f5] border-b border-[#eadfda] p-6 text-center relative">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-secondary-dark hover:text-[#5a3630] transition text-xl font-bold cursor-pointer"
                                >
                                    &times;
                                </button>
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4ece9] text-[#5a3630]">
                                    <QrCode size={24} />
                                </div>
                                <h2 className="text-xl font-extrabold text-[#2f1a16] mb-1">
                                    Scan to Pay with Bakong KHQR
                                </h2>
                                <p className="text-xs font-semibold text-secondary-dark uppercase tracking-wider">
                                    {bill_number ? `Order: ${bill_number}` : "Quick Payment"}
                                </p>
                            </div>

                            {/* QR Code Container */}
                            <div className="p-6 flex flex-col items-center border-b border-[#eadfda] bg-white">
                                <div className="relative rounded-[20px] border-2 border-[#eadfda] bg-white p-3 shadow-inner">
                                    {qr_code ? (
                                        <img
                                            src={qrImageUrl}
                                            alt="Bakong KHQR Code"
                                            className="h-64 w-64 object-contain rounded-[12px]"
                                        />
                                    ) : (
                                        <div className="h-64 w-64 flex items-center justify-center bg-gray-100 rounded-[12px] text-gray-400">
                                            No QR Code Available
                                        </div>
                                    )}
                                </div>
                                <p className="mt-4 text-center text-xs text-secondary-dark font-medium max-w-[280px]">
                                    Scan this KHQR code with any Bakong-enabled banking app to complete your payment.
                                </p>
                            </div>

                            {/* Transaction Details */}
                            <div className="bg-[#fcf9f7] p-6 space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-[#f3ede9] pb-3">
                                    <span className="font-semibold text-secondary-dark">Amount Payable</span>
                                    <span className="text-xl font-extrabold text-[#2f1a16]">
                                        ${Number(amount || 0).toFixed(2)}
                                    </span>
                                </div>

                                {description && (
                                    <div className="flex justify-between items-start text-sm border-b border-[#f3ede9] pb-3">
                                        <span className="font-semibold text-secondary-dark shrink-0 mr-4">Description</span>
                                        <span className="text-right font-medium text-[#2f1a16]">
                                            {description}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-secondary-dark">Payment Status</span>
                                    {paymentStatus === "checking" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-blue-600" />
                                            Verifying...
                                        </span>
                                    ) : paymentStatus === "error" ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                            Verification Error
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                            Pending Scan
                                        </span>
                                    )}
                                </div>

                                {errorMsg && (
                                    <div className="mt-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl p-3 text-center font-medium">
                                        {errorMsg}
                                    </div>
                                )}
                            </div>

                            {/* Action Footer */}
                            <div className="p-6 bg-white space-y-3">
                                <button
                                    type="button"
                                    onClick={handleCheckStatus}
                                    disabled={paymentStatus === "checking" || checkingManual}
                                    className="w-full h-12 bg-[#5a3630] hover:bg-[#4a2b25] disabled:bg-[#f4ece9] disabled:text-secondary-dark text-white rounded-xl font-bold shadow-md transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {paymentStatus === "checking" || checkingManual ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </>
                                    ) : (
                                        "Check Payment Status"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full text-center text-xs font-bold text-secondary-dark hover:text-[#5a3630] transition pt-2 cursor-pointer"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
}
