import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import { QrCode, ArrowLeft, ShieldCheck, Copy, Check } from "lucide-react";

export default function Checkout({ qr_code, md5, amount, bill_number, description }) {
    const [copied, setCopied] = useState(false);
    const [transition, setTransition] = useState(null);

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qr_code)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(qr_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCheckStatus = () => {
        // Simulate checking payment status or implement actual status checking
        alert("Checking payment status for MD5: " + md5);
    };

    const headWeb = "Bakong KHQR Payment";

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} />}
        >
            <Head title={headWeb} />

            <div className="mx-auto max-w-md py-6 px-4">
                {/* Back Link */}
                <div className="mb-4">
                    <Link
                        href={route('orders.index')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7b5f58] hover:text-[#5a3630] transition"
                    >
                        <ArrowLeft size={16} />
                        Back to Orders
                    </Link>
                </div>

                {/* Main Card */}
                <div className="overflow-hidden rounded-[24px] border border-[#eadfda] bg-white shadow-[0_12px_36px_rgba(54,37,30,0.06)]">
                    {/* Header */}
                    <div className="bg-[#fcf9f7] border-b border-[#eadfda] p-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4ece9] text-[#5a3630]">
                            <QrCode size={24} />
                        </div>
                        <h2 className="text-xl font-extrabold text-[#2f1a16] mb-1">
                            Scan to Pay with Bakong KHQR
                        </h2>
                        <p className="text-xs font-semibold text-[#7b5f58] uppercase tracking-wider">
                            {bill_number ? `Order: ${bill_number}` : "Quick Payment"}
                        </p>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-6 flex flex-col items-center border-b border-[#eadfda]">
                        <div className="relative rounded-[20px] border-2 border-[#eadfda] bg-white p-3 shadow-inner">
                            <img
                                src={qrImageUrl}
                                alt="Bakong KHQR Code"
                                className="h-64 w-64 object-contain rounded-[12px]"
                            />
                        </div>
                        <p className="mt-4 text-center text-xs text-[#7b5f58] font-medium max-w-[280px]">
                            Scan this KHQR code with any Bakong-enabled banking app to complete your payment.
                        </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-[#fcf9f7] p-6 space-y-4">
                        <div className="flex justify-between items-center text-sm border-b border-[#f3ede9] pb-3">
                            <span className="font-semibold text-[#7b5f58]">Amount Payable</span>
                            <span className="text-xl font-extrabold text-[#2f1a16]">
                                ${Number(amount).toFixed(2)}
                            </span>
                        </div>

                        {description && (
                            <div className="flex justify-between items-start text-sm border-b border-[#f3ede9] pb-3">
                                <span className="font-semibold text-[#7b5f58] shrink-0 mr-4">Description</span>
                                <span className="text-right font-medium text-[#2f1a16]">
                                    {description}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-[#7b5f58]">Payment Status</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Scan
                            </span>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 bg-white space-y-3">
                        <button
                            type="button"
                            onClick={handleCheckStatus}
                            className="w-full h-11 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-full font-bold shadow-md transition flex items-center justify-center gap-2"
                        >
                            <ShieldCheck size={18} />
                            Verify Payment
                        </button>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="w-full h-11 bg-white hover:bg-[#fbf8f5] text-[#5a3630] border border-[#eadfda] rounded-full font-bold transition flex items-center justify-center gap-2"
                        >
                            {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                            {copied ? "Copied KHQR!" : "Copy KHQR String"}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
