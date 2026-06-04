export default function CreateTypeForm({
    show,
    editingTypeId,
    title,
    setTitle,
    onClose,
    onSubmit,
    isSubmitting,
}) {
    if (!show) return null;

    return (
        <div
            className="fixed inset-0 flex h-full w-full items-center justify-center"
            style={{ background: "rgba(19, 14, 13, 0.35)", zIndex: 1080 }}
        >
            <div
                className="rounded-3xl p-4 md:p-5"
                style={{
                    background: "#f7f4f2",
                    width: "min(620px, 92vw)",
                    border: "1px solid #eadfda",
                }}
            >
                <div className="mb-3 flex items-start justify-between">
                    <h2
                        className="mb-0"
                        style={{
                            color: "#2f1a16",
                            fontSize: "2rem",
                            fontWeight: 700,
                        }}
                    >
                        {editingTypeId ? "Edit Type" : "Add Type"}
                    </h2>
                    <button
                        type="button"
                        className="border-0 bg-transparent p-0"
                        style={{
                            background: "transparent",
                            color: "#7b5f58",
                            fontSize: 26,
                            lineHeight: 1,
                        }}
                        onClick={onClose}
                    >
                        x
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label
                            className="block text-xs uppercase"
                            style={{
                                color: "#6f4f47",
                                fontWeight: 600,
                                letterSpacing: ".03em",
                            }}
                        >
                            Type Name
                        </label>
                        <input
                            className="w-full rounded-2xl border border-[#cd9d78] px-3 py-2"
                            style={{ height: 52, fontSize: "1.1rem" }}
                            placeholder="e.g. Hot"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            className="rounded-full border border-[#d6ccc8] px-4 py-2"
                            style={{
                                color: "#4a2b25",
                                background: "#f9f5f2",
                                fontWeight: 600,
                            }}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-full px-4 py-2"
                            style={{
                                background: "#5a3630",
                                color: "#fff",
                                fontWeight: 700,
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? editingTypeId
                                    ? "Updating..."
                                    : "Creating..."
                                : editingTypeId
                                  ? "Update"
                                  : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
