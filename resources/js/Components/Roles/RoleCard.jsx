import { ShieldCheck, Trash2, Check, PenBox } from "lucide-react";

export default function RoleCard({ role, allPermissions, onEdit, onDelete, canManageRole }) {
    // Check if a permission is assigned to this role
    const hasPermission = (permissionName) => {
        return role.permissions?.some(p => p.name === permissionName);
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-6 w-full transition-all duration-300 hover:shadow-md">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-full bg-primary-dark flex items-center justify-center text-white shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-main" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-bold text-primary-dark tracking-tight">{role.name}</h3>
                        <p className="text-sm text-secondary-text font-medium">{role.users_count || 0} members</p>
                    </div>
                </div>
                {canManageRole && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(role)}
                            className="p-2 text-primary-dark hover:bg-hover rounded-full transition-colors duration-200"
                            title="Edit Role"
                        >
                            <PenBox className="w-5 h-5 text-secondary-dark" />
                        </button>
                        <button
                            onClick={() => onDelete(role)}
                            className="p-2 text-primary-dark hover:bg-hover rounded-full transition-colors duration-200"
                            title="Delete Role"
                        >
                            <Trash2 className="w-5 h-5 text-danger" />
                        </button>
                    </div>
                )}
            </div>

            {/* Permissions List */}
            <div className="flex flex-col gap-2">
                {allPermissions.map((permission) => {
                    const active = hasPermission(permission.name);
                    return (
                        <div
                            key={permission.id}
                            className={`flex justify-between items-center px-4 py-2.5 rounded-2xl border transition-all duration-200 ${
                                active
                                    ? "bg-[#FAF7F2] border-[#EADBC8] hover:border-[#D9A066]/60"
                                    : "bg-background/20 border-gray-100 opacity-60"
                            }`}
                        >
                            <span className="text-sm font-semibold text-primary-dark/95 tracking-wide">
                                {permission.name}
                            </span>
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    active
                                        ? "bg-secondary-dark text-white"
                                        : "bg-gray-100 text-transparent border border-gray-200"
                                }`}
                            >
                                <Check className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
