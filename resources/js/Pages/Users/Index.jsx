import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import Modal from "@/Components/Modal";
import UserHeader from "@/Components/Users/UserHeader";
import { UserForm } from "@/Pages/Users/CreateEdit";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Badge from "@/Components/ui/Badge";
import {
    Pencil, Trash2
} from "lucide-react"

export default function UserPage({ users }) {
    const userList = users?.data ?? [];
    const [showForm, setShowForm] = useState(false);
    const [activeUser, setActiveUser] = useState(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { roles = [] } = usePage().props;
    const { delete: destroy, processing } = useForm();

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredUsers = normalizedSearchTerm
        ? userList.filter((user) => {
              const userName = user?.name?.toLowerCase() ?? "";
              const userEmail = user?.email?.toLowerCase() ?? "";
              const roleName = user?.roles?.[0]?.name?.toLowerCase() ?? "";
              return (
                  userName.includes(normalizedSearchTerm) ||
                  userEmail.includes(normalizedSearchTerm) ||
                  roleName.includes(normalizedSearchTerm)
              );
          })
        : userList;

    const getInitials = (name = "") =>
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "U";

    const getRoleBadgeVariant = (roleName = "") => {
        const normalizedRole = roleName.toLowerCase();

        if (normalizedRole.includes("admin")) return "warning";
        if (normalizedRole.includes("manager")) return "warning";
        if (normalizedRole.includes("cashier")) return "info";
        if (normalizedRole.includes("barista")) return "success";
        if (normalizedRole.includes("kitchen")) return "primary";

        return "default";
    };

    const getStatusVariant = (statusValue = "") => {
        const normalizedStatus = String(statusValue).toLowerCase();

        if (normalizedStatus === "active" || normalizedStatus === "1") {
            return "success";
        }

        if (
            normalizedStatus === "off" ||
            normalizedStatus === "inactive" ||
            normalizedStatus === "0"
        ) {
            return "danger";
        }

        return "default";
    };

    const formatShift = (shiftValue) => shiftValue || "-";
    const formatStatus = (statusValue) => statusValue || "Active";

    const confirmDelete = (user) => {
        setDeletingUser(user);
        setConfirmingDelete(true);
    };

    const closeDeleteModal = () => {
        setConfirmingDelete(false);
        setDeletingUser(null);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        if (!deletingUser?.id) {
            return;
        }

        destroy(route("users.destroy", deletingUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeDeleteModal();
            },
            onFinish: () => {
                closeDeleteModal();
            },
        });
    };

    const headWeb = "Users List";
    return (
        <AdminLayout>
            <Head title={headWeb} />
            <section className="min-h-screen bg-background px-4 py-6 md:px-6 lg:px-8">
                <UserHeader
                    total={users?.total ?? userList.length}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    onCreateClick={() => {
                        setActiveUser(null);
                        setShowForm(true);
                    }}
                />
                <Modal
                    show={showForm}
                    onClose={() => {
                        setShowForm(false);
                        setActiveUser(null);
                    }}
                    maxWidth="2xl"
                >
                    <div className="p-4">
                        <UserForm
                            key={activeUser?.id ?? "create-user"}
                            user={activeUser ?? {}}
                            roles={roles}
                            onCancel={() => {
                                setShowForm(false);
                                setActiveUser(null);
                            }}
                            onSuccess={() => {
                                setShowForm(false);
                                setActiveUser(null);
                            }}
                        />
                    </div>
                </Modal>
                <Modal
                    show={confirmingDelete}
                    onClose={closeDeleteModal}
                    maxWidth="md"
                >
                    <form
                        onSubmit={deleteUser}
                        className="p-6 bg-white rounded-xl"
                    >
                        <h2 className="text-lg font-medium text-gray-900">
                            Confirm delete
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-gray-900">
                                {deletingUser?.name}
                            </span>
                            ?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton
                                type="button"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </SecondaryButton>
                            <DangerButton disabled={processing}>
                                Delete
                            </DangerButton>
                        </div>
                    </form>
                </Modal>
                <div className="mt-4 overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-amber-100">
                            <thead className="bg-[#fbf6ef]">
                                <tr className="text-left text-xs font-bold uppercase tracking-[0.18em] text-[#9a6b43]">
                                    <th className="px-5 py-4">Name</th>
                                    <th className="px-5 py-4">Role</th>
                                    <th className="px-5 py-4">Shift</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100 bg-white">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => {
                                        const roleName =
                                            user?.roles?.[0]?.name || "Member";
                                        const shiftValue = formatShift(
                                            user?.shift,
                                        );
                                        const statusValue = formatStatus(
                                            user?.status,
                                        );

                                        return (
                                            <tr
                                                key={user.id}
                                                className="transition hover:bg-amber-50/60"
                                            >
                                                <td className="px-5 py-4 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#5b342f] text-sm font-bold text-white">
                                                            {getInitials(
                                                                user?.name,
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-[15px] font-semibold text-[#3b241f]">
                                                                {user?.name ||
                                                                    "User Name"}
                                                            </div>
                                                            <div className="text-sm text-[#7e5a4a]">
                                                                {user?.email ||
                                                                    "example@email.com"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 align-middle">
                                                    <Badge>{roleName}</Badge>
                                                </td>
                                                <td className="px-5 py-4 align-middle text-[15px] font-medium text-[#3b241f]">
                                                    {shiftValue}
                                                </td>
                                                <td className="px-5 py-4 align-middle">
                                                    <Badge
                                                        variant={getStatusVariant(
                                                            statusValue,
                                                        )}
                                                    >
                                                        {statusValue}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 align-middle">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveUser(
                                                                    user,
                                                                );
                                                                setShowForm(
                                                                    true,
                                                                );
                                                            }}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-infoColor transition hover:bg-info-bg/60"
                                                            aria-label="Edit user"
                                                        >
                                                            <Pencil size={18} strokeWidth={2.5} className="text-infoColor" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    user,
                                                                )
                                                            }
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-danger transition hover:bg-danger-bg/60"
                                                            aria-label="Delete user"
                                                        >
                                                            <Trash2 size={18} strokeWidth={2.5} className="text-danger"/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-10 text-center text-sm text-secondary-text"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {users?.links && <Pagination links={users.links} />}
            </section>
        </AdminLayout>
    );
}
