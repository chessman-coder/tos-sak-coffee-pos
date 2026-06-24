export default function CreateProductOptionForm({
    show,
    editingOptionId,
    name,
    setName,
    isRequired,
    setIsRequired,
    values,
    setValues,
    addValueRow,
    removeValueRow,
    updateValueRow,
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
                    width: "min(760px, 92vw)",
                    border: "1px solid #eadfda",
                }}
            >
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <h2
                            className="mb-0"
                            style={{
                                color: "#2f1a16",
                                fontSize: "2rem",
                                fontWeight: 700,
                            }}
                        >
                            {editingOptionId ? "Edit Option" : "Add Option"}
                        </h2>
                    </div>
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
                            Option Name
                        </label>
                        <input
                            className="w-full rounded-2xl border border-[#cd9d78] px-3 py-2"
                            style={{ height: 52, fontSize: "1.1rem" }}
                            placeholder="e.g. Sugar Level"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            className="inline-flex items-center gap-2 text-sm"
                            style={{ color: "#5f4038", fontWeight: 600 }}
                        >
                            <input
                                type="checkbox"
                                checked={Boolean(isRequired)}
                                onChange={(e) =>
                                    setIsRequired(e.target.checked)
                                }
                            />
                            Required when ordering
                        </label>
                    </div>

                    <div className="mb-2">
                        <div className="mb-2 grid grid-cols-2 md:grid-cols-[1fr_200px_auto] items-center gap-3">
                            <div>
                                <label
                                    className="block text-xs uppercase"
                                    style={{
                                        color: "#6f4f47",
                                        fontWeight: 600,
                                        letterSpacing: ".03em",
                                    }}
                                >
                                    Values
                                </label>
                            </div>

                            <div className="text-left md:text-left">
                                <label
                                    className="block text-xs uppercase"
                                    style={{
                                        color: "#6f4f47",
                                        fontWeight: 600,
                                        letterSpacing: ".03em",
                                    }}
                                >
                                    Upcharge($)
                                </label>
                            </div>

                            <div className="flex justify-end md:justify-start">
                                <button
                                    type="button"
                                    className="rounded-full border border-[#d6ccc8] px-4 py-2"
                                    style={{
                                        color: "#4a2b25",
                                        background: "#f9f5f2",
                                        fontWeight: 600,
                                    }}
                                    onClick={addValueRow}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {values.map((value, index) => (
                                <div
                                    key={value.id ?? index}
                                    className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_180px_auto] md:items-center"
                                >
                                    <input
                                        className="w-full rounded-2xl border border-[#ded2cc] px-3 py-2"
                                        style={{
                                            height: 52,
                                            fontSize: "1.05rem",
                                        }}
                                        placeholder={
                                            index === 0
                                                ? "e.g. 50%"
                                                : "e.g. +1 Shot"
                                        }
                                        value={value.value}
                                        onChange={(e) =>
                                            updateValueRow(
                                                index,
                                                "value",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className="w-full rounded-2xl border border-[#ded2cc] px-3 py-2"
                                        style={{
                                            height: 52,
                                            fontSize: "1.05rem",
                                        }}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Upcharge ($)"
                                        value={value.upcharge}
                                        onChange={(e) =>
                                            updateValueRow(
                                                index,
                                                "upcharge",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="rounded-full border border-[#d6ccc8] px-4 py-2"
                                        style={{
                                            color: "#4a2b25",
                                            background: "#f9f5f2",
                                            fontWeight: 600,
                                        }}
                                        onClick={() => removeValueRow(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <small style={{ color: "#8b6e66" }}>
                            Type and press Add or Enter
                        </small>
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
                                ? editingOptionId
                                    ? "Updating..."
                                    : "Creating..."
                                : editingOptionId
                                  ? "Update"
                                  : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
