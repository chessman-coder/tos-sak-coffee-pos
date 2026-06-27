import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import SizeCard from "@/Components/Catalog/SizeCard";
import SizeModal from "@/Components/Catalog/SizeModal";
import Button from "@/Components/ui/Button";
import DeleteConfirmDialog from "@/Components/DeleteConfirmDialog";

export default function SizesTab() {
    const [sizes, setSizes] = useState([]);

    const [newSizeTitle, setNewSizeTitle] = useState("");
    const [newSizeUpcharge, setNewSizeUpcharge] = useState("");
    const [editingSizeId, setEditingSizeId] = useState(null);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState(null);

    useEffect(() => {
        fetchSizes();
    }, []);

    function fetchSizes() {
        window.axios
            .get("/api/catalog/sizes")
            .then((r) => setSizes(r.data))
            .catch(() => { });
    }

    function createSize(e) {
        e?.preventDefault?.();
        if (editingSizeId) {
            window.axios
                .patch(`/api/catalog/sizes/${editingSizeId}`, {
                    title: newSizeTitle,
                    upcharge: newSizeUpcharge,
                })
                .then(() => {
                    setNewSizeTitle("");
                    setNewSizeUpcharge(0);
                    setEditingSizeId(null);
                    setIsSizeModalOpen(false);
                    fetchSizes();
                })
                .catch(() => { });
        } else {
            window.axios
                .post("/api/catalog/sizes", {
                    title: newSizeTitle,
                    upcharge: newSizeUpcharge,
                })
                .then(() => {
                    setNewSizeTitle("");
                    setNewSizeUpcharge(0);
                    setIsSizeModalOpen(false);
                    fetchSizes();
                })
                .catch(() => { });
        }
    }

    function requestDeleteSize(size) {
        setDeleteDialog({
            type: "size",
            id: size.id,
            label: size.title,
            title: "Delete size?",
        });
    }

    function openEditSize(size) {
        setEditingSizeId(size?.id ?? null);
        setNewSizeTitle(size?.title ?? "");
        setNewSizeUpcharge(size?.upcharge ?? size?.price ?? 0);
        setIsSizeModalOpen(true);
    }

    function openSizeModal() {
        setEditingSizeId(null);
        setNewSizeTitle("");
        setNewSizeUpcharge(0);
        setIsSizeModalOpen(true);
    }

    async function confirmDelete() {
        if (!deleteDialog) return;

        try {
            if (deleteDialog.type === "size") {
                await window.axios.delete(`/api/catalog/sizes/${deleteDialog.id}`);
            }

            setDeleteDialog(null);
            fetchSizes();
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
                <h2 className="text-xl font-semibold mb-0">Sizes</h2>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={openSizeModal}
                        className="inline-flex items-center rounded-full px-4 py-2"
                        variant="fillDark"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Size
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {sizes.map((size) => (
                    <SizeCard key={size.id} size={size} onEdit={openEditSize} onDelete={requestDeleteSize} />
                ))}
            </div>

            <SizeModal
                show={isSizeModalOpen}
                onClose={() => setIsSizeModalOpen(false)}
                onSubmit={createSize}
                title={editingSizeId ? "Edit Size" : "Add Size"}
                titleValue={newSizeTitle}
                onTitleChange={setNewSizeTitle}
                upchargeValue={newSizeUpcharge}
                onUpchargeChange={setNewSizeUpcharge}
                submitLabel={editingSizeId ? "Update" : "Create"}
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
