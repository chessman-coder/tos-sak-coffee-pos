import Breadcrumb from "@/Components/Breadcrumb";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import SecondaryButton from "@/Components/SecondaryButton";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import moment from "moment";
import { useState } from "react";

export default function OrderPage({ orderData }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = orderData.data ?? [];

    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});
    const {
        data: deleteData,
        setData: setDeleteData,
        delete: destroy,
        processing,
        reset,
        clearErrors,
    } = useForm({ id: "", order_number: "" });

    const confirmDataDeletion = (data) => {
        setDataEdit(data);
        setDeleteData("id", data.id);
        setDeleteData("order_number", data.order_number);
        setConfirmingDataDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({});
        clearErrors();
        reset();
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        if (!dataEdit?.id) return;
        destroy(route("orders.destroy", dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const headWeb = "Order List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info">
                            <div className="card-header">
                                <h3 className="card-title">
                                    Datalist Management
                                </h3>
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
                                <Modal
                                    show={confirmingDataDeletion}
                                    onClose={closeModal}
                                >
                                    <form
                                        onSubmit={deleteDataRow}
                                        className="p-6"
                                    >
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Confirmation!
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Are you sure you want to delete{" "}
                                            <span className="text-lg font-medium">
                                                {deleteData.order_number}
                                            </span>
                                            ?
                                        </p>
                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton
                                                onClick={closeModal}
                                            >
                                                No
                                            </SecondaryButton>
                                            <DangerButton
                                                className="ms-3"
                                                disabled={processing}
                                            >
                                                Yes
                                            </DangerButton>
                                        </div>
                                    </form>
                                </Modal>
                            </div>
                            <div className="card-footer clearfix">
                                <Pagination links={orderData.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
