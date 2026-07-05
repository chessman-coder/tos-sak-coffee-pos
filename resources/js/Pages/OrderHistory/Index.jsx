import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import Pagination from "@/Components/Pagination";
import Badge from "@/Components/ui/Badge";
import OrderDetailModal from "@/Components/OrderHistory/OrderDetailModal";
import { Eye } from "lucide-react";

export default function OrderPage({ orderData }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = orderData.data ?? [];
    const [selectedOrder, setSelectedOrder] = useState(null);

    const headWeb = "Order History";

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
        <AdminLayout>
            <Head title={headWeb} />
            <section className="min-h-screen bg-background px-4 py-6 md:px-6 lg:px-8">
                <div className="p-4 md:p-7">
                    {/* Header Section */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-bold text-primary-dark">
                                {headWeb}
                            </h1>
                        </div>
                        {can["Manage Pos Checkout"] && (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Link
                                    href={route("pos.index")}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#eadfda] bg-white px-5 text-sm font-bold text-[#4a2b25] shadow-sm transition hover:bg-[#fbf8f5] cursor-pointer"
                                >
                                    Back to POS
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Table Container */}
                    <div className="w-full overflow-x-auto rounded-[22px] border border-[#eadfda] bg-white shadow-[0_10px_24px_rgba(54,37,30,0.04)]">
                        <table className="min-w-full divide-y divide-[#eadfda] text-left">
                            <thead>
                                <tr className="bg-[#fcf8f6]">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">#ID</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">Order Number</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">Order Method</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">Payment</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#6f4f47] border-b border-[#eadfda] align-middle">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#eadfda]">
                                {datasList.length > 0 ? (
                                    datasList.map((item, k) => (
                                        <tr key={k} className="border-b border-[#eadfda] last:border-b-0 hover:bg-[#fcf8f6]/50 transition duration-150">
                                            <td className="px-6 py-4 align-middle whitespace-nowrap text-sm text-[#4a2b25]">{k + 1}</td>
                                            <td className="px-6 py-4 align-middle whitespace-nowrap text-sm font-bold text-[#2f1a16]">{item?.order_number}</td>
                                            <td className="px-6 py-4 align-middle whitespace-nowrap text-sm text-[#4a2b25]">
                                                {item?.order_method === "self_order" ? "Self Ordering" : "Walk-in Order"}
                                            </td>
                                            <td className="px-6 py-4 align-middle whitespace-nowrap text-sm text-[#4a2b25]">
                                                {item?.payment_method === "khqr" ? "KHQR" : "Cash"}
                                            </td>
                                            <td className="px-6 py-4 align-middle whitespace-nowrap">
                                                {getStatusBadge(item?.status)}
                                            </td>
                                            <td className="px-6 py-4 align-middle whitespace-nowrap text-sm font-extrabold text-[#2f1a16]">
                                                {formatCurrency(Number(item?.total_amount ?? 0))}
                                            </td>
                                            <td className="px-6 py-4 align-middle whitespace-nowrap text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedOrder(item)}
                                                    className="text-primary-dark hover:text-[#5a3630] transition border-none appearance-none outline-none"
                                                    title="View Order Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-[#8a6a55]">
                                            There are no records!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orderData?.links && (
                        <div className="mt-6 flex justify-end">
                            <Pagination links={orderData.links} />
                        </div>
                    )}
                </div>
            </section>

            {/* View Details Modal */}
            <OrderDetailModal
                order={selectedOrder}
                show={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </AdminLayout>
    );
}
