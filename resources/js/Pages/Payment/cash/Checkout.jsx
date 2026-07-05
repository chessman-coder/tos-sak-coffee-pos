import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { Banknote, ArrowLeft, Coins, AlertTriangle } from "lucide-react";
import Modal from "@/Components/Modal";
import SuccessView from "@/Components/SuccessView";

export default function Checkout({ order_id, amount, bill_number, isAdmin = false }) {
    const [cashReceived, setCashReceived] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, error
    const [errorMsg, setErrorMsg] = useState("");
    const [changeDue, setChangeDue] = useState(0);
    const [isValidPayment, setIsValidPayment] = useState(false);

    const totalAmount = Number(amount || 0);

    // Calculate change and validate payment when cashReceived changes
    useEffect(() => {
        if (!isAdmin) return;
        const received = parseFloat(cashReceived);
        if (isNaN(received) || received < totalAmount) {
            setChangeDue(0);
            setIsValidPayment(false);
        } else {
            setChangeDue(received - totalAmount);
            setIsValidPayment(true);
        }
    }, [cashReceived, totalAmount, isAdmin]);

    // Customer Polling for payment confirmation
    useEffect(() => {
        if (isAdmin || !order_id || paymentStatus === "success") return;

        const checkPayment = async () => {
            try {
                // Pass dummy md5 as cash to bypass controller validation check
                const response = await fetch(route('payment.check', { id: order_id, md5: 'cash' }));
                const result = await response.json();

                if (result.success) {
                    setPaymentStatus("success");
                }
            } catch (err) {
                console.error("Payment check error:", err);
            }
        };

        checkPayment();
        const intervalId = setInterval(checkPayment, 5000);
        return () => clearInterval(intervalId);
    }, [order_id, paymentStatus, isAdmin]);

    const handleClose = () => {
        if (order_id && paymentStatus !== "success") {
            localStorage.removeItem("pos_cart");
            localStorage.removeItem("client_order_cart");
            router.post(route("payment.cancel", order_id));
        } else {
            router.visit(isAdmin ? route("pos.index") : "/");
        }
    };

    // Handle quick amount buttons
    const handleQuickAmount = (val) => {
        if (val === "exact") {
            setCashReceived(totalAmount.toFixed(2));
        } else {
            setCashReceived(val.toString());
        }
    };

    // Quick cash denominations
    const denominations = [5, 10, 20, 50, 100];
    // Suggest relevant quick values that are >= totalAmount
    const suggestedDenominations = denominations.filter(d => d >= totalAmount).slice(0, 4);
    // If no denoms suggested (e.g. amount is large), fallback to showing common ones or exact change
    if (suggestedDenominations.length === 0) {
        suggestedDenominations.push(Math.ceil(totalAmount));
        suggestedDenominations.push(Math.ceil(totalAmount / 5) * 5);
        suggestedDenominations.push(Math.ceil(totalAmount / 10) * 10);
    }

    const handleConfirmPayment = () => {
        if (!isValidPayment || paymentStatus === "processing") return;

        setPaymentStatus("processing");
        setErrorMsg("");

        axios.post(route("payment.confirm-cash", order_id), {
            amount_received: cashReceived,
            change_amount: changeDue,
        })
            .then(response => {
                if (response.data.success) {
                    setPaymentStatus("success");
                    localStorage.removeItem("pos_cart");
                } else {
                    setPaymentStatus("error");
                    setErrorMsg(response.data.message || "Failed to confirm cash payment.");
                }
            })
            .catch(error => {
                setPaymentStatus("error");
                setErrorMsg(error.response?.data?.message || "An error occurred during payment confirmation.");
            });
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const formatPrice = (price) => {
        return Number(price ?? 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <>
            <Head title="Cash Checkout" />
            <Modal show={true} onClose={handleClose} maxWidth="md">
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#eadfda]">
                    {paymentStatus === "success" ? (
                        <SuccessView
                            amount={amount}
                            bill_number={bill_number}
                            payment_method="cash"
                            cash_received={cashReceived || amount}
                            change_due={changeDue}
                            onPrintReceipt={isAdmin ? handlePrintReceipt : null}
                            isAdmin={isAdmin}
                        />
                    ) : !isAdmin ? (
                        /* Customer View: Waiting for payment at counter */
                        <div className="p-8 text-center space-y-6">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ece9] text-[#5a3630] animate-bounce">
                                <Banknote size={32} />
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold text-[#2f1a16] tracking-tight">
                                    Proceed to Counter
                                </h2>
                                <p className="text-sm font-semibold text-secondary-dark">
                                    Please pay at the cashier to complete your order.
                                </p>
                            </div>

                            <div className="bg-[#fcf9f7] rounded-2xl p-5 border border-[#eadfda] text-left space-y-3.5 shadow-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-secondary-dark font-semibold">Order Number</span>
                                        <span className="text-[#2f1a16] font-bold">{bill_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-[#f3ede9] pt-2">
                                        <span className="text-secondary-dark font-semibold">Total Amount</span>
                                        <span className="text-[#5a3630] font-black text-lg">${formatPrice(amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-[#f3ede9] pt-2">
                                        <span className="text-secondary-dark font-semibold">Equivalent in Riel</span>
                                        <span className="text-secondary-dark font-bold text-sm">≈ ៛{(amount * 4000).toLocaleString('en-US')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                        Waiting for cashier confirmation...
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    This page will automatically update once payment is received.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-[#eadfda] flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 h-12 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-xl font-bold shadow-md transition flex items-center justify-center cursor-pointer"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Cash Input & Verification View */
                        <>
                            {/* Header */}
                            <div className="bg-[#fbf8f5] border-b border-[#eadfda] p-6 text-center relative">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 left-4 text-secondary-dark hover:text-[#5a3630] transition flex items-center gap-1 text-sm font-bold cursor-pointer"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-secondary-dark hover:text-[#5a3630] transition text-xl font-bold cursor-pointer"
                                >
                                    &times;
                                </button>
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4ece9] text-[#5a3630]">
                                    <Banknote size={24} />
                                </div>
                                <h2 className="text-xl font-extrabold text-[#2f1a16] mb-1">
                                    Cash Checkout
                                </h2>
                                <p className="text-xs font-semibold text-secondary-dark uppercase tracking-wider">
                                    {bill_number ? `Order: ${bill_number}` : "Quick Checkout"}
                                </p>
                            </div>

                            {/* Total Payable & Cash Received Form */}
                            <div className="p-6 space-y-6 bg-white">
                                {/* Total Payable Display */}
                                <div className="text-center space-y-1 bg-[#fcf9f7] rounded-2xl p-6 border border-[#eadfda]">
                                    <span className="text-xs font-bold text-secondary-dark uppercase tracking-wider">Total Payable</span>
                                    <div className="text-4xl font-black text-[#5a3630] tracking-tight">
                                        ${formatPrice(totalAmount)}
                                    </div>
                                </div>

                                {/* Amount Received Field */}
                                <div className="space-y-2">
                                    <label htmlFor="cash_received" className="block text-sm font-extrabold text-secondary-dark">
                                        Cash Received
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <span className="text-secondary-dark font-extrabold text-lg">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="cash_received"
                                            id="cash_received"
                                            step="0.01"
                                            min="0"
                                            className="block w-full rounded-xl border-[#eadfda] pl-9 pr-4 py-3 text-lg font-black text-[#2f1a16] placeholder:text-gray-300 focus:border-[#5a3630] focus:ring-[#5a3630]"
                                            placeholder="0.00"
                                            value={cashReceived}
                                            onChange={(e) => setCashReceived(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Quick Cash Shortcuts */}
                                <div className="space-y-2.5">
                                    <span className="block text-xs font-bold text-secondary-dark uppercase tracking-wider">Quick Amount Options</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAmount("exact")}
                                            className="h-11 bg-[#f4ece9] hover:bg-[#ebdcd6] text-[#5a3630] font-extrabold text-xs rounded-xl transition cursor-pointer border border-[#eadfda]"
                                        >
                                            Exact Amount
                                        </button>
                                        {suggestedDenominations.map((denom) => (
                                            <button
                                                key={denom}
                                                type="button"
                                                onClick={() => handleQuickAmount(denom)}
                                                className={`h-11 font-extrabold text-sm rounded-xl transition cursor-pointer border border-[#eadfda] ${Number(cashReceived) === denom
                                                    ? "bg-[#5a3630] text-white"
                                                    : "bg-white hover:bg-[#fbf8f5] text-secondary-dark"
                                                    }`}
                                            >
                                                ${denom}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Payment status, change, and errors display */}
                            <div className="bg-[#fcf9f7] p-6 border-t border-[#eadfda] space-y-4">
                                {cashReceived !== "" && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-secondary-dark">Change Return</span>
                                        {isValidPayment ? (
                                            <span className="text-xl font-extrabold text-success animate-pulse">
                                                ${formatPrice(changeDue)}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                <AlertTriangle size={14} />
                                                Waiting for full amount
                                            </span>
                                        )}
                                    </div>
                                )}

                                {errorMsg && (
                                    <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl p-3 text-center font-medium">
                                        {errorMsg}
                                    </div>
                                )}
                            </div>

                            {/* Action Footer */}
                            <div className="p-6 bg-white border-t border-[#eadfda] space-y-3">
                                <button
                                    type="button"
                                    onClick={handleConfirmPayment}
                                    disabled={!isValidPayment || paymentStatus === "processing"}
                                    className="w-full h-12 bg-[#5a3630] hover:bg-[#4a2b25] disabled:bg-[#f4ece9] disabled:text-secondary-dark text-white rounded-xl font-bold shadow-md transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {paymentStatus === "processing" ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <Coins size={18} />
                                            Complete Cash Order
                                        </>
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
