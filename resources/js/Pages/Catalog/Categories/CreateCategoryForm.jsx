import { X } from "lucide-react";
import React from "react";

export default function CreateCategoryForm({
    show,
    editingCategoryId,
    name,
    setName,
    draftSubCategory,
    setDraftSubCategory,
    draftSubCategories,
    addDraftSubCategory,
    removeDraftSubCategory,
    onClose,
    onSubmit,
    isCreating,
}) {
    if (!show) return null;

    return (
        <div
            className="fixed inset-0 flex h-full w-full items-center justify-center"
            style={{ background: "rgba(19, 14, 13, 0.35)", zIndex: 1080 }}
        >
            <div
                className="rounded-3xl p-4 md:p-5"
                style={{ background: "#f7f4f2", width: "min(700px, 92vw)", border: "1px solid #eadfda" }}
            >
                <div className="mb-3 flex items-start justify-between">
                    <h2 className="mb-0" style={{ color: "#2f1a16", fontSize: "2rem", fontWeight: 700 }}>
                        {editingCategoryId ? "Edit Category" : "Add Category"}
                    </h2>
                    <button
                        type="button"
                        className="border-0 bg-transparent p-0"
                        style={{ background: "transparent", color: "#7b5f58", fontSize: 26, lineHeight: 1 }}
                        onClick={onClose}
                    >
                        <X size={18}/>
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="block text-xs uppercase" style={{ color: "#6f4f47", fontWeight: 600, letterSpacing: ".03em" }}>
                            Category Name
                        </label>
                        <input
                            className="w-full rounded-2xl border border-[#cd9d78] px-3 py-2"
                            style={{ height: 52, fontSize: "1.1rem" }}
                            placeholder="e.g. Drinks"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-2">
                        <label className="block text-xs uppercase" style={{ color: "#6f4f47", fontWeight: 600, letterSpacing: ".03em" }}>
                            Sub-Categories
                        </label>
                        <div className="flex gap-2">
                            <input
                                className="w-full rounded-2xl border border-[#ded2cc] px-3 py-2"
                                style={{ height: 52, fontSize: "1.1rem" }}
                                placeholder="e.g. Coffee"
                                value={draftSubCategory}
                                onChange={(e) => setDraftSubCategory(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addDraftSubCategory();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="rounded-2xl border border-[#d6ccc8] px-4"
                                style={{ color: "#4a2b25", background: "#f9f5f2", fontWeight: 600 }}
                                onClick={addDraftSubCategory}
                            >
                                Add
                            </button>
                        </div>
                        <small style={{ color: "#8b6e66" }}>Type and press Add or Enter</small>
                    </div>

                    {draftSubCategories.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {draftSubCategories.map((item) => (
                                <span key={item} className="inline-flex items-center rounded-full px-3 py-2" style={{ background: "#ede3dd", color: "#4d2e28", fontWeight: 600 }}>
                                    {item}
                                    <button
                                        type="button"
                                        className="ml-2 border-0 bg-transparent p-0"
                                        style={{ background: "transparent", color: "#6f4f47", lineHeight: 1 }}
                                        onClick={() => removeDraftSubCategory(item)}
                                    >
                                        x
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            className="rounded-full border border-[#d6ccc8] px-4 py-2"
                            style={{ color: "#4a2b25", background: "#f9f5f2", fontWeight: 600 }}
                            onClick={onClose}
                            disabled={isCreating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-full px-4 py-2"
                            style={{ background: "#5a3630", color: "#fff", fontWeight: 700 }}
                            disabled={isCreating}
                        >
                            {isCreating ? (editingCategoryId ? "Updating..." : "Creating...") : (editingCategoryId ? "Update" : "Create")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
