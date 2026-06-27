import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import CategoryCard from "@/Components/Catalog/CategoryCard";
import Button from "@/Components/ui/Button";
import DeleteConfirmDialog from "@/Components/DeleteConfirmDialog";
import CreateCategoryForm from "@/Pages/Catalog/Categories/CreateCategoryForm";

export default function CategoriesTab() {
    const [categories, setCategories] = useState([]);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [draftSubCategory, setDraftSubCategory] = useState("");
    const [draftSubCategories, setDraftSubCategories] = useState([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    function fetchCategories() {
        window.axios
            .get("/api/catalog/categories")
            .then((r) => setCategories(r.data))
            .catch(() => { });
    }

    function requestDeleteCategory(category) {
        setDeleteDialog({
            type: "category",
            id: category.id,
            label: category.name,
            title: "Delete category?",
        });
    }

    function openCategoryModal() {
        setNewCategoryName("");
        setDraftSubCategory("");
        setDraftSubCategories([]);
        setEditingCategoryId(null);
        setIsCategoryModalOpen(true);
    }

    function openEditCategoryModal(category) {
        setEditingCategoryId(category?.id ?? null);
        setNewCategoryName(category?.name ?? "");
        setDraftSubCategory("");
        const existing = groupedSubCategories[String(category?.id)] || [];
        setDraftSubCategories(existing.map((s) => s.name));
        setIsCategoryModalOpen(true);
    }

    function closeCategoryModal() {
        if (isCreatingCategory) return;
        setIsCategoryModalOpen(false);
        setEditingCategoryId(null);
    }

    function addDraftSubCategory() {
        const value = draftSubCategory.trim();
        if (!value) return;

        if (!draftSubCategories.includes(value)) {
            setDraftSubCategories((prev) => [...prev, value]);
        }
        setDraftSubCategory("");
    }

    function removeDraftSubCategory(name) {
        setDraftSubCategories((prev) => prev.filter((item) => item !== name));
    }

    async function createCategoryWithSubcategories(e) {
        e?.preventDefault?.();
        const categoryName = newCategoryName.trim();
        if (!categoryName) return;

        try {
            setIsCreatingCategory(true);

            if (editingCategoryId) {
                await window.axios.patch(
                    `/api/catalog/categories/${editingCategoryId}`,
                    { name: categoryName },
                );

                const existing = groupedSubCategories[String(editingCategoryId)] || [];
                const removed = existing.filter(
                    (subCategory) => !draftSubCategories.includes(subCategory.name),
                );

                if (removed.length > 0) {
                    await Promise.all(
                        removed.map((subCategory) =>
                            window.axios.delete(`/api/catalog/categories/${subCategory.id}`),
                        ),
                    );
                }

                const existingNames = existing.map((s) => s.name);
                const toCreate = draftSubCategories.filter((n) => !existingNames.includes(n));

                if (toCreate.length > 0) {
                    await Promise.all(
                        toCreate.map((name) =>
                            window.axios.post("/api/catalog/categories", {
                                name,
                                parent_id: editingCategoryId,
                            }),
                        ),
                    );
                }
            } else {
                const parentRes = await window.axios.post("/api/catalog/categories", {
                    name: categoryName,
                    parent_id: null,
                });

                const parentId = parentRes?.data?.id;

                if (parentId && draftSubCategories.length > 0) {
                    await Promise.all(
                        draftSubCategories.map((name) =>
                            window.axios.post("/api/catalog/categories", {
                                name,
                                parent_id: parentId,
                            }),
                        ),
                    );
                }
            }

            closeCategoryModal();
            fetchCategories();
        } catch (error) {
            // lightweight
        } finally {
            setIsCreatingCategory(false);
        }
    }

    const parentCategories = categories.filter((c) => !c.parent_id);

    const groupedSubCategories = categories
        .filter((c) => c.parent_id)
        .reduce((acc, current) => {
            const key = String(current.parent_id);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(current);
            return acc;
        }, {});

    async function confirmDelete() {
        if (!deleteDialog) return;

        try {
            if (deleteDialog.type === "category") {
                await window.axios.delete(`/api/catalog/categories/${deleteDialog.id}`);
            }

            setDeleteDialog(null);
            fetchCategories();
        } catch (error) { }
    }

    function closeDeleteDialog() {
        setDeleteDialog(null);
    }

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-primary-text mb-0">Categories</h2>
                <Button
                    type="button"
                    onClick={openCategoryModal}
                    className="inline-flex items-center rounded-full px-4 py-2"
                    variant="fillDark"
                >
                    <Plus size={18} className="mr-2" />
                    Add Category
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {parentCategories.map((category) => {
                    const subItems = groupedSubCategories[String(category.id)] || [];

                    return (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            subItems={subItems}
                            onDelete={requestDeleteCategory}
                            onEdit={openEditCategoryModal}
                        />
                    );
                })}
            </div>

            {parentCategories.length === 0 && (
                <div
                    className="rounded-3xl p-4"
                    style={{
                        background: "#fff",
                        border: "1px dashed #ceb8b0",
                        color: "#7b5f58",
                    }}
                >
                    No categories yet. Click Add Category to create your first one.
                </div>
            )}

            <CreateCategoryForm
                show={isCategoryModalOpen}
                editingCategoryId={editingCategoryId}
                name={newCategoryName}
                setName={setNewCategoryName}
                draftSubCategory={draftSubCategory}
                setDraftSubCategory={setDraftSubCategory}
                draftSubCategories={draftSubCategories}
                addDraftSubCategory={addDraftSubCategory}
                removeDraftSubCategory={removeDraftSubCategory}
                onClose={closeCategoryModal}
                onSubmit={createCategoryWithSubcategories}
                isCreating={isCreatingCategory}
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
