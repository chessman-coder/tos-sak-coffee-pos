import Breadcrumb from "@/Components/Breadcrumb";
import InputError from "@/Components/InputError";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { useRef, useState } from "react";

export function UserForm({
    user = {},
    roles = [],
    onCancel,
    onSuccess,
    submitLabel,
}) {
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || "");
    const { data, setData, post, patch, errors, reset, processing } = useForm({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        "confirm-password": "",
        roles: user.roles?.map((role) => role.id) || [],
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setAvatarPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        if (!user.id) {
            post(route("users.store"), {
                preserveState: true,
                onSuccess: () => {
                    onSuccess?.();
                    reset();
                },
                onFinish: () => {
                    reset();
                },
            });
        } else {
            patch(route("users.update", user.id), {
                onSuccess: () => {
                    onSuccess?.();
                    reset();
                },
                onFinish: () => {
                    reset();
                },
            });
        }
    };

    const finalSubmitLabel = submitLabel ?? (user?.id ? "Update" : "Create");

    return (
        <form onSubmit={submit}>
            <div className="rounded-4 bg-white p-4 p-md-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="mb-0 text-2xl font-semibold text-slate-700">
                        {user?.id ? "Edit User" : "New User"}
                    </h2>
                </div>

                {/* <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div
                        className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-400 transition hover:border-slate-400 hover:bg-slate-100"
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                    >
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="h-full w-full rounded-2xl object-cover"
                            />
                        ) : (
                            <span>Drag image here</span>
                        )}
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="mb-1 text-sm text-slate-500">Drag image here</p>
                        <p className="mb-1 text-sm text-slate-500">or</p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-0 bg-transparent p-0 text-sm font-medium text-blue-500 hover:text-blue-600"
                        >
                            Browse image
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div> */}

                <div className="space-y-4">
                    <div className="row align-items-center g-3">
                        <div className="col-md-4">
                            <label
                                className="mb-0 form-label fw-semibold text-slate-700"
                                htmlFor="name"
                            >
                                Employee Name
                            </label>
                        </div>
                        <div className="col-md-8">
                            <input
                                value={data.name ?? ""}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                type="text"
                                name="name"
                                className={`form-control rounded-lg border-slate-300 py-2 shadow-none ${errors.name ? "is-invalid" : ""}`}
                                id="name"
                                placeholder="Enter employee name"
                            />
                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>
                    </div>

                    <div className="row align-items-center g-3">
                        <div className="col-md-4">
                            <label
                                htmlFor="email"
                                className="mb-0 form-label fw-semibold text-slate-700"
                            >
                                Email
                            </label>
                        </div>
                        <div className="col-md-8">
                            <input
                                id="email"
                                type="email"
                                className="form-control rounded-lg border-slate-300 py-2 shadow-none"
                                placeholder="Enter employee email"
                                value={data.email ?? ""}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="row align-items-center g-3">
                        <div className="col-md-4">
                            <label
                                htmlFor="password"
                                className="mb-0 form-label fw-semibold text-slate-700"
                            >
                                Password
                            </label>
                        </div>
                        <div className="col-md-8">
                            <input
                                id="password"
                                type="password"
                                className="form-control rounded-lg border-slate-300 py-2 shadow-none"
                                placeholder="Enter new password"
                                value={data.password ?? ""}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="row align-items-center g-3">
                        <div className="col-md-4">
                            <label
                                className="mb-0 form-label fw-semibold text-slate-700"
                                htmlFor="confirm-password"
                            >
                                Confirm Password
                            </label>
                        </div>
                        <div className="col-md-8">
                            <input
                                id="confirm-password"
                                type="password"
                                className="form-control rounded-lg border-slate-300 py-2 shadow-none"
                                placeholder="Confirm new password"
                                value={data["confirm-password"] ?? ""}
                                onChange={(e) =>
                                    setData("confirm-password", e.target.value)
                                }
                            />
                            <InputError
                                message={errors["confirm-password"]}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="row align-items-center g-3">
                        <div className="col-md-4">
                            <label
                                className="mb-0 form-label fw-semibold text-slate-700"
                                htmlFor="roles"
                            >
                                Role
                            </label>
                        </div>
                        <div className="col-md-8">
                            <select
                                name="roles"
                                id="roles"
                                value={
                                    Array.isArray(data.roles)
                                        ? (data.roles[0] ?? "")
                                        : ""
                                }
                                onChange={(e) =>
                                    setData("roles", [parseInt(e.target.value)])
                                }
                                className="form-select rounded-lg border-slate-300 py-2 shadow-none"
                            >
                                <option value="">Select User role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>

                            <InputError
                                className="mt-2"
                                message={errors.roles || errors["roles.0"]}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-light border px-4 py-2 text-slate-600"
                            disabled={processing}
                        >
                            Discard
                        </button>
                    )}
                    <button
                        disabled={processing}
                        type="submit"
                        className="btn btn-primary px-4 py-2"
                    >
                        {processing
                            ? user?.id
                                ? "Updating..."
                                : "Saving..."
                            : finalSubmitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function UsersCreateEdit({ user = {}, roles = [] }) {
    const headWeb = "User Create";
    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <UserForm user={user} roles={roles} />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
