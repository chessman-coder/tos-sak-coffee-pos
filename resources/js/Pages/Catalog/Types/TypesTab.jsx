import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import TypeCard from "../../../Components/Catalog/TypeCard";
import Button from "@/Components/ui/Button";
import DeleteConfirmDialog from "@/Components/DeleteConfirmDialog";
import CreateTypeForm from "./CreateTypeForm";

export default function TypesTab() {
    const [types, setTypes] = useState([]);
    const [newTypeTitle, setNewTypeTitle] = useState("");
    const [editingTypeId, setEditingTypeId] = useState(null);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(null);

    useEffect(() => {
        fetchTypes();
    }, []);

    function fetchTypes() {
        window.axios
            .get("/api/catalog/types")
            .then((r) => setTypes(r.data))
            .catch(() => { });
    }

    function openTypeModal() {
        setEditingTypeId(null);
        setNewTypeTitle("");
        setIsTypeModalOpen(true);
    }

    function openEditTypeModal(type) {
        setEditingTypeId(type?.id ?? null);
        setNewTypeTitle(type?.title ?? "");
        setIsTypeModalOpen(true);
    }

    function closeTypeModal() {
        if (isSubmitting) return;
        setIsTypeModalOpen(false);
        setEditingTypeId(null);
    }

    async function saveType(e) {
        e?.preventDefault?.();
        const title = newTypeTitle.trim();
        if (!title) return;

        try {
            setIsSubmitting(true);

            if (editingTypeId) {
                await window.axios.patch(`/api/catalog/types/${editingTypeId}`, {
                    title,
                });
            } else {
                await window.axios.post("/api/catalog/types", { title });
            }

            closeTypeModal();
            fetchTypes();
        } catch (error) {
            // lightweight
        } finally {
            setIsSubmitting(false);
        }
    }

    function requestDeleteType(type) {
        setDeleteDialog({
            type: "type",
            id: type.id,
            label: type.title,
            title: "Delete type?",
        });
    }

    async function confirmDelete() {
        if (!deleteDialog) return;

        try {
            if (deleteDialog.type === "type") {
                await window.axios.delete(`/api/catalog/types/${deleteDialog.id}`);
            }

            setDeleteDialog(null);
            fetchTypes();
        } catch (error) {
            // lightweight
        }
    }

    function closeDeleteDialog() {
        setDeleteDialog(null);
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold mb-0">Types</h2>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={openTypeModal}
                        className="inline-flex items-center rounded-full px-4 py-2"
                        variant="fillDark"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Type
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {types.map((type) => (
                    <TypeCard
                        key={type.id}
                        type={type}
                        onEdit={openEditTypeModal}
                        onDelete={requestDeleteType}
                    />
                ))}
            </div>

            {types.length === 0 && (
                <div
                    className="rounded-3xl p-4"
                    style={{
                        background: "#fff",
                        border: "1px dashed #ceb8b0",
                        color: "#7b5f58",
                    }}
                >
                    No types yet. Click Add Type to create your first one.
                </div>
            )}

            <CreateTypeForm
                show={isTypeModalOpen}
                editingTypeId={editingTypeId}
                title={newTypeTitle}
                setTitle={setNewTypeTitle}
                onClose={closeTypeModal}
                onSubmit={saveType}
                isSubmitting={isSubmitting}
            />

            <DeleteConfirmDialog
                show={Boolean(deleteDialog)}
                title={deleteDialog?.title}
                description={`Are you sure you want to delete "${deleteDialog?.label}"? This action cannot be undone.`}
                confirmText="Delete"
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
