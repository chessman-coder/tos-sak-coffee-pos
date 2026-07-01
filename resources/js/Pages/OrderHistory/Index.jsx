import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import moment from "moment";

export default function OrderPage({ orderData }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = orderData.data ?? [];

    const headWeb = "Order History";

    return (
        <AdminLayout>
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info">
                            <div className="card-header flex justify-between items-center">
                                <h3 className="card-title m-0">
                                    Order History
                                </h3>
                                {can["Manage Pos Checkout"] && (
                                    <Link 
                                        href={route("pos.index")}
                                        className="inline-flex items-center justify-center rounded-xl border border-[#eadfda] bg-white px-3 py-1.5 text-xs font-bold text-secondary-dark shadow-sm transition hover:bg-[#fbf8f5] cursor-pointer"
                                    >
                                        Back to POS
                                    </Link>
                                )}
                            </div>
                            <div className="card-body table-responsive p-0">
                                <table className="table table-hover text-nowrap">
                                    <thead>
                                        <tr>
                                            <th>#ID</th>
                                            <th>Order Number</th>
                                            <th>Order Method</th>
                                            <th>Payment</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datasList.length > 0 ? (
                                            datasList.map((item, k) => (
                                                <tr key={k}>
                                                    <td>{k + 1}</td>
                                                    <td>
                                                        {item?.order_number}
                                                    </td>
                                                    <td>
                                                        {item?.order_method ===
                                                            "qr_order"
                                                            ? "QR Order"
                                                            : "Walk-in Order"}
                                                    </td>
                                                    <td>
                                                        {item?.payment_method ===
                                                            "khqr"
                                                            ? "KHQR"
                                                            : "Cash"}
                                                    </td>
                                                    <td>
                                                        {moment(
                                                            item?.order_date,
                                                        ).format("DD/MM/YYYY")}
                                                    </td>
                                                    <td>{item?.status}</td>
                                                    <td>
                                                        $
                                                        {Number(
                                                            item?.total_amount ??
                                                            0,
                                                        ).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={10}>
                                                    There are no record!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
