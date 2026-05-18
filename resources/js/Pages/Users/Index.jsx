import UserCard from "@/Components/Users/UserCard";
import Pagination from "@/Components/Pagination";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import Modal from "@/Components/Modal";
import UserHeader from "@/Components/Users/UserHeader";
import { UserForm } from "@/Pages/Users/CreateEdit";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";

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
              return userName.includes(normalizedSearchTerm);
          })
        : userList;

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
            <section className="content">
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
                <div className="flex flex-wrap gap-6 justify-center md:w-full">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={(selectedUser) => {
                                    setActiveUser(selectedUser);
                                    setShowForm(true);
                                }}
                                onDelete={confirmDelete}
                            />
                        ))
                    ) : (
                        <div>No users found.</div>
                    )}
                </div>
                {users?.links && <Pagination links={users.links} />}
            </section>
        </AdminLayout>
    );
}
