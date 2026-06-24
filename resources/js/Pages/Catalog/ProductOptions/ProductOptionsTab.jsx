import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/Components/ui/Button";
import DeleteConfirmDialog from "@/Components/Catalog/DeleteConfirmDialog";
import CreateProductOptionForm from "./CreateProductOptionForm";
import ProductOptionCard from "@/Components/Catalog/ProductOptionCard";

export default function ProductOptionsTab() {
    const [options, setOptions] = useState([]);
    const [newOptionName, setNewOptionName] = useState("");
    const [isRequired, setIsRequired] = useState(false);
    const [editingOptionId, setEditingOptionId] = useState(null);
    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [optionValues, setOptionValues] = useState([{ value: "", upcharge: 0 }]);
    const [deleteDialog, setDeleteDialog] = useState(null);

    useEffect(() => {
        fetchOptions();
    }, []);

    function fetchOptions() {
        window.axios
            .get("/api/catalog/product-options")
            .then((r) => setOptions(r.data))
            .catch(() => {});
    }

    function openOptionModal() {
        setEditingOptionId(null);
        setNewOptionName("");
        setIsRequired(false);
        setOptionValues([{ value: "", upcharge: 0 }]);
        setIsOptionModalOpen(true);
    }

    function openEditOptionModal(option) {
        setEditingOptionId(option?.id ?? null);
        setNewOptionName(option?.name ?? "");
        setIsRequired(Boolean(option?.is_required));
        setOptionValues(
            Array.isArray(option?.values) && option.values.length > 0
                ? option.values.map((value) => ({
                      id: value.id,
                      value: value.value ?? "",
                      upcharge: value.upcharge ?? 0,
                  }))
                : [{ value: "", upcharge: 0 }],
        );
        setIsOptionModalOpen(true);
    }

    function closeOptionModal() {
        if (isSubmitting) return;
        setIsOptionModalOpen(false);
        setEditingOptionId(null);
    }

    function addValueRow() {
        setOptionValues((prev) => [...prev, { value: "", upcharge: 0 }]);
    }

    function removeValueRow(index) {
        setOptionValues((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    }

    function updateValueRow(index, field, value) {
        setOptionValues((prev) =>
            prev.map((row, itemIndex) => (itemIndex === index ? { ...row, [field]: field === "upcharge" ? value : value } : row)),
        );
    }

    function requestDeleteOption(option) {
        setDeleteDialog({
            type: "option",
            id: option.id,
            label: option.name,
            title: "Delete option?",
        });
    }

    async function saveOption(e) {
        e?.preventDefault?.();
        const name = newOptionName.trim();

        if (!name) return;

        const normalizedValues = optionValues
            .map((value) => ({
                id: value.id,
                value: String(value.value ?? "").trim(),
                upcharge: Number(value.upcharge ?? 0),
            }))
            .filter((value) => value.value);

        if (normalizedValues.length === 0) return;

        try {
            setIsSubmitting(true);

            const payload = {
                name,
                is_required: isRequired,
                values: normalizedValues,
            };

            if (editingOptionId) {
                await window.axios.patch(`/api/catalog/product-options/${editingOptionId}`, payload);
            } else {
                await window.axios.post("/api/catalog/product-options", payload);
            }

            closeOptionModal();
            fetchOptions();
        } catch (error) {
            // lightweight
        } finally {
            setIsSubmitting(false);
        }
    }

    async function confirmDelete() {
        if (!deleteDialog) return;

        try {
            if (deleteDialog.type === "option") {
                await window.axios.delete(`/api/catalog/product-options/${deleteDialog.id}`);
            }

            setDeleteDialog(null);
            fetchOptions();
        } catch (error) {
            // lightweight
        }
    }

    function closeDeleteDialog() {
        setDeleteDialog(null);
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold mb-0">Global Options</h2>
                </div>

                <Button
                    type="button"
                    onClick={openOptionModal}
                    className="inline-flex items-center rounded-full px-4 py-2"
                    variant="fillDark"
                >
                    <Plus size={18} className="mr-2" />
                    Add Option
                </Button>
            </div>

            <div className="space-y-6">
                {options.length === 0 ? (
                    <div
                        className="rounded-3xl p-4"
                        style={{
                            background: "#fff",
                            border: "1px dashed #ceb8b0",
                            color: "#7b5f58",
                        }}
                    >
                        No product options yet. Click Add Option to create your first one.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {options.map((option) => (
                            <ProductOptionCard
                                key={option.id}
                                option={option}
                                onEdit={openEditOptionModal}
                                onDelete={requestDeleteOption}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateProductOptionForm
                show={isOptionModalOpen}
                editingOptionId={editingOptionId}
                name={newOptionName}
                setName={setNewOptionName}
                isRequired={isRequired}
                setIsRequired={setIsRequired}
                values={optionValues}
                setValues={setOptionValues}
                addValueRow={addValueRow}
                removeValueRow={removeValueRow}
                updateValueRow={updateValueRow}
                onClose={closeOptionModal}
                onSubmit={saveOption}
                isSubmitting={isSubmitting}
            />

            <DeleteConfirmDialog
                show={Boolean(deleteDialog)}
                title={deleteDialog?.title}
                description={`Are you sure you want to delete "${deleteDialog?.label}" ? This action cannot be undone.`}
                confirmText="Delete"
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
