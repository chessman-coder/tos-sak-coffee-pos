import { useEffect, useRef, useState } from "react";
import Modal from "@/Components/Modal";
import { ChevronDown, X } from "lucide-react";

const fieldClassName =
    "w-full rounded-2xl border border-[#d9c7bf] bg-white px-4 py-3 text-sm text-[#2f1a16] outline-none transition focus:border-[#b78a78] focus:ring-2 focus:ring-[#edd9cf]";

function ComboField({ label, value, onChange, options = [], placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    return (
        <label className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                {label}
            </span>
            <div ref={wrapperRef} className="relative">
                <div className="flex overflow-hidden rounded-2xl border border-[#d9c7bf] bg-white transition focus-within:border-[#b78a78] focus-within:ring-2 focus-within:ring-[#edd9cf]">
                    <input
                        className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-[#2f1a16] outline-none"
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                    />
                    <button
                        type="button"
                        onClick={() => setIsOpen((current) => !current)}
                        className="flex shrink-0 items-center justify-center border-l border-[#eadfda] px-3 text-[#7b5f58] transition hover:bg-[#fcf8f6]"
                        aria-label={`Show ${label.toLowerCase()} options`}
                        aria-expanded={isOpen}
                    >
                        <ChevronDown size={18} />
                    </button>
                </div>

                {isOpen && options.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-2xl border border-[#eadfda] bg-white p-1 shadow-lg">
                        {options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className="flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm text-[#2f1a16] transition hover:bg-[#fcf8f6]"
                            >
                                <span>{option}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </label>
    );
}

export default function InventoryFormModal({
    show,
    title,
    form,
    setForm,
    imageUrl = "",
    categoryOptions = [],
    unitOptions = [],
    supplierOptions = [],
    onClose,
    onSubmit,
    isSubmitting,
}) {
    const fileInputRef = useRef(null);
    const lastBlobRef = useRef(null);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    

    if (!show) return null;

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const setSelectedImage = (file) => {
        const previewUrl = file ? URL.createObjectURL(file) : imageUrl;

        setForm((current) => {
            // Revoke any previously created blob URL that we own
            if (lastBlobRef.current && lastBlobRef.current !== previewUrl) {
                try {
                    URL.revokeObjectURL(lastBlobRef.current);
                } catch (e) {}
                lastBlobRef.current = null;
            }

            if (file) {
                lastBlobRef.current = previewUrl;
            } else {
                lastBlobRef.current = null;
            }

            return {
                ...current,
                image: file,
                imagePreview: previewUrl,
            };
        });
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0] ?? null;

        if (!file) {
            event.target.value = "";
            return;
        }

        setSelectedImage(file);
        event.target.value = "";
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDraggingImage(false);

        const file = event.dataTransfer.files?.[0] ?? null;

        if (!file || !file.type.startsWith("image/")) return;

        setSelectedImage(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl" backdropClassName="bg-black/35">
            <div className="rounded-[28px] border border-[#eadfda] bg-[#f8f4f1] p-5 md:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="mb-1 text-3xl font-bold text-[#2f1a16]">{title}</h2>
                        <p className="mb-0 text-sm text-[#7b5f58]">
                            Track inventory items and keep the stock history in sync.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-[#e1d0c8] bg-white p-2 text-xl leading-none text-[#7b5f58]"
                    >
                        <X/>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Image
                        </span>
                        <div
                            className={`mx-auto flex min-h-40 min-w-58 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-white transition ${
                                form.imagePreview || imageUrl
                                    ? "border-[#e1d0c8]"
                                    : isDraggingImage
                                        ? "border-[#5a3630] bg-[#fcf8f6]"
                                        : "border-[#e1d0c8] hover:border-[#b78a78] hover:bg-[#fcf8f6]"
                            }`}
                            // onClick={openFilePicker}
                            onDragEnter={() => setIsDraggingImage(true)}
                            onDragLeave={() => setIsDraggingImage(false)}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {form.imagePreview || imageUrl ? (
                                <img
                                    src={form.imagePreview || imageUrl}
                                    alt="Inventory preview"
                                    className="mx-auto block h-24 w-24 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-2 text-center">
                                    <div className="text-sm font-semibold leading-5 text-[#5f4038]">
                                        Drag and drop the image here or browse
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            openFilePicker();
                                        }}
                                        className="rounded-full border border-[#d6ccc8] bg-white px-4 py-2 text-sm font-semibold text-[#4a2b25] shadow-sm transition hover:bg-[#fcf8f6]"
                                    >
                                        Browse
                                    </button>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </label>

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">Name</span>
                        <input
                            className={fieldClassName}
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="Arabica Beans"
                        />
                    </label>

                    <ComboField
                        label="Category"
                        value={form.category}
                        onChange={(value) => updateField("category", value)}
                        options={categoryOptions}
                        placeholder="Beans"
                    />

                    <ComboField
                        label="Unit"
                        value={form.unit}
                        onChange={(value) => updateField("unit", value)}
                        options={unitOptions}
                        placeholder="kg"
                    />

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">Stock on hand</span>
                        <input
                            type="number"
                            min="0"
                            className={fieldClassName}
                            value={form.stock}
                            onChange={(e) => updateField("stock", e.target.value)}
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">Reorder level</span>
                        <input
                            type="number"
                            min="0"
                            className={fieldClassName}
                            value={form.reorderLevel}
                            onChange={(e) => updateField("reorderLevel", e.target.value)}
                        />
                    </label>

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">Unit cost</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={fieldClassName}
                            value={form.unitCost}
                            onChange={(e) => updateField("unitCost", e.target.value)}
                        />
                    </label>

                    <ComboField
                        label="Supplier"
                        value={form.supplier}
                        onChange={(value) => updateField("supplier", value)}
                        options={supplierOptions}
                        placeholder="Mondulkiri Farms"
                    />

                    <div className="md:col-span-2 mt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-full border border-[#d6ccc8] bg-white px-5 py-2.5 font-semibold text-[#4a2b25] shadow-sm transition hover:bg-[#fcf8f6] disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-full bg-[#5a3630] px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-[#4a2b25] disabled:opacity-60"
                        >
                            {isSubmitting ? "Saving..." : "Save item"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
