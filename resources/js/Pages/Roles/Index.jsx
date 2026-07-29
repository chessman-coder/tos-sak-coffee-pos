import AdminLayout from "@/Layouts/AdminLayout";
import RoleCard from "@/Components/Roles/RoleCard";
import RoleModal from "@/Components/Roles/RoleModal";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/Components/ui/Button";
import DeleteConfirmDialog from "@/Components/DeleteConfirmDialog";

export default function UserPage({ roles, permissions = [] }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = roles.data;

    // Delete state
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});
    const {
        data: deleteData,
        setData: setDeleteData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        id: "",
        name: "",
    });

    const confirmDataDeletion = (data) => {
        setDataEdit(data);
        setDeleteData("id", data.id);
        setDeleteData("name", data.name);
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
        destroy(route("roles.destroy", dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    // Add / Edit Role Modal State
    const [confirmingRoleForm, setConfirmingRoleForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const openCreateModal = () => {
        setEditingRole(null);
        setConfirmingRoleForm(true);
    };

    const openEditModal = (role) => {
        setEditingRole(role);
        setConfirmingRoleForm(true);
    };

    const closeRoleModal = () => {
        setConfirmingRoleForm(false);
        setEditingRole(null);
    };

    const headWeb = "Roles & Permissions";

    return (
        <AdminLayout>
            <Head title={headWeb} />
            <div className="bg-background min-h-screen p-8 flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex justify-between items-start sm:flex-row flex-col gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-[32px] font-bold text-primary-dark tracking-tight">Roles & Permissions</h1>
                        <p className="text-secondary-text mt-1 text-base">Define what each role can do</p>
                    </div>
                    {can["Manage Role"] && (
                        <Button
                            onClick={openCreateModal}
                            variant="fillDark"
                            size="sm"
                            className="rounded-full flex items-center gap-2 justify-center"
                        >
                            <Plus />
                            <span>Add Role</span>
                        </Button>
                    )}
                </div>

                {/* Grid of Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-start">
                    {datasList.length > 0 ? (
                        [...datasList]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((role) => (
                                <RoleCard
                                    key={role.id}
                                    role={role}
                                    allPermissions={permissions}
                                    onEdit={openEditModal}
                                    onDelete={confirmDataDeletion}
                                    canManageRole={can["Manage Role"]}
                                />
                            ))
                    ) : (
                        <div className="col-span-2 text-center py-16 text-secondary-text bg-white rounded-3xl border border-[#EADBC8]/30 shadow-sm">
                            <p className="text-lg font-medium text-primary-dark">No Roles found</p>
                            <p className="text-sm text-secondary-text mt-1">Get started by creating a new role above.</p>
                        </div>
                    )}
                </div>

                {/* Create / Edit Role Modal Component */}
                <RoleModal
                    show={confirmingRoleForm}
                    onClose={closeRoleModal}
                    role={editingRole}
                    permissions={permissions}
                />

                {/* Confirmation Modal */}
                <DeleteConfirmDialog
                    show={confirmingDataDeletion}
                    title="Delete Role"
                    onClose={closeModal}
                    description={`Are you sure you want to delete "${deleteData.name}"?`}
                    confirmText="Delete"
                    processing={processing}
                    onConfirm={deleteDataRow}
                />
            </div>
        </AdminLayout>
    );
}
