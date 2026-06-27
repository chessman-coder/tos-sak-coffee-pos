import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputError from "@/Components/InputError";
import { X } from "lucide-react";

export default function RoleModal({ show, onClose, role, permissions }) {
    const {
        data,
        setData,
        post,
        patch,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        name: "",
        permissions: [],
    });

    useEffect(() => {
        if (show) {
            if (role) {
                setData({
                    name: role.name,
                    permissions: role.permissions ? role.permissions.map((p) => p.id) : [],
                });
            } else {
                setData({
                    name: "",
                    permissions: [],
                });
            }
            clearErrors();
        }
    }, [show, role]);

    const handleSelectPermission = (id, checked) => {
        if (checked) {
            if (!data.permissions.includes(id)) {
                setData("permissions", [...data.permissions, id]);
            }
        } else {
            setData("permissions", data.permissions.filter((pId) => pId !== id));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (role) {
            patch(route("roles.update", role.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route("roles.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form
                onSubmit={submit}
                className="p-8 flex flex-col gap-6 relative bg-white rounded-[32px]"
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-primary-dark">
                        {role ? "Edit Role & Permission" : "Add Role & Permission"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-secondary-text hover:text-primary-dark hover:bg-hover rounded-full transition-colors duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Name Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-secondary-dark uppercase tracking-wider">
                        Name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Manager"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-2xl border ${
                            errors.name ? "border-danger" : "border-[#EADBC8]"
                        } bg-white text-primary-dark placeholder-gray-400 focus:outline-none focus:border-secondaryColor focus:ring-1 focus:ring-secondaryColor transition-all duration-200`}
                    />
                    {errors.name && <InputError message={errors.name} />}
                </div>

                {/* Permissions Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-secondary-dark uppercase tracking-wider">
                        Permissions
                    </label>
                    <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                        {permissions.map((permission) => {
                            const formatted = permission.name;
                            const isChecked = data.permissions.includes(permission.id);
                            return (
                                <label
                                    key={permission.id}
                                    className={`flex justify-between items-center px-4 py-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                                        isChecked
                                            ? "bg-[#FAF7F2] border-[#EADBC8]"
                                            : "bg-background/10 border-gray-100 hover:bg-background/20"
                                    }`}
                                >
                                    <span className="text-sm font-semibold text-primary-dark">
                                        {formatted}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) =>
                                            handleSelectPermission(permission.id, e.target.checked)
                                        }
                                        className="w-5 h-5 rounded border-[#EADBC8] text-secondary-dark focus:ring-secondary-light focus:ring-offset-0 focus:ring-1 cursor-pointer"
                                    />
                                </label>
                            );
                        })}
                    </div>
                    {errors.permissions && <InputError message={errors.permissions} />}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex justify-end gap-3 mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 border border-[#EADBC8] hover:bg-hover/30 text-primary-dark font-semibold rounded-full transition-all duration-200 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 bg-primaryColor hover:bg-primary-dark text-white font-semibold rounded-full transition-all duration-200 shadow-sm text-sm disabled:opacity-50"
                    >
                        {role ? "Update" : "Create"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
