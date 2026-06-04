import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import { ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";

const fieldClassName =
    "w-full rounded-2xl border border-[#d9c7bf] bg-white px-4 py-3 text-sm text-[#2f1a16] outline-none transition focus:border-[#b78a78] focus:ring-2 focus:ring-[#edd9cf]";

export default function ProductFormModal({
    show,
    title,
    data,
    setData,
    imageUrl = "",
    errors = {},
    categories = [],
    subCategories = [],
    types = [],
    sizes = [],
    onClose,
    onSubmit,
    processing,
}) {
    const fileInputRef = useRef(null);
    const lastBlobRef = useRef(null);
    const [isDraggingImage, setIsDraggingImage] = useState(false);

    if (!show) return null;

    const updateField = (field, value) => {
        setData(field, value);
    };

    const selectedParentCategoryId = data.parent_category_id
        ? String(data.parent_category_id)
        : "";
    const filteredSubCategories = selectedParentCategoryId
        ? subCategories.filter((category) => String(category.parent_id) === selectedParentCategoryId)
        : [];

    const updateParentCategory = (value) => {
        setData({
            ...data,
            parent_category_id: value,
            category_id: "",
        });
    };

    const toggleSize = (sizeTitle) => {
        const selectedSizes = data.sizes ?? [];
        const nextSizes = selectedSizes.includes(sizeTitle)
            ? selectedSizes.filter((value) => value !== sizeTitle)
            : [...selectedSizes, sizeTitle];

        setData("sizes", nextSizes);
    };

    const setSelectedImage = (file) => {
        const previewUrl = file ? URL.createObjectURL(file) : imageUrl;

        if (lastBlobRef.current && lastBlobRef.current !== previewUrl) {
            try {
                URL.revokeObjectURL(lastBlobRef.current);
            } catch (e) {}
            lastBlobRef.current = null;
        }

        if (file) {
            lastBlobRef.current = previewUrl;
        }

        setData({
            ...data,
            image: file,
            imagePreview: previewUrl,
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
        <Modal show={show} onClose={onClose} maxWidth="2xl" backdropClassName="bg-black/70">
            <div className="rounded-[14px] border border-[#eadfda] bg-[#f8f4f1] p-5 md:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <h2 className="mb-0 text-2xl font-bold text-[#2f1a16]">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border-0 bg-transparent p-1 text-[#7b5f58] transition hover:bg-white"
                        aria-label="Close product form"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Name
                        </span>
                        <input
                            className={fieldClassName}
                            value={data.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            placeholder="e.g. Caramel Latte"
                        />
                        <InputError message={errors.name} />
                    </label>

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Category
                        </span>
                        <select
                            className={fieldClassName}
                            value={data.parent_category_id}
                            onChange={(event) => updateParentCategory(event.target.value)}
                        >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Sub-category
                        </span>
                        <select
                            className={fieldClassName}
                            value={data.category_id}
                            onChange={(event) => updateField("category_id", event.target.value)}
                            disabled={!selectedParentCategoryId}
                        >
                            <option value="">Select sub-category</option>
                            {filteredSubCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.category_id} />
                    </label>

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Type
                        </span>
                        <select
                            className={fieldClassName}
                            value={data.type}
                            onChange={(event) => updateField("type", event.target.value)}
                        >
                            <option value="">Select type</option>
                            {types.map((type) => (
                                <option key={type.id} value={type.title}>
                                    {type.title}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.type} />
                    </label>

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Price ($)
                        </span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={fieldClassName}
                            value={data.price}
                            onChange={(event) => updateField("price", event.target.value)}
                            placeholder="0"
                        />
                        <InputError message={errors.price} />
                    </label>

                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Stock
                        </span>
                        <input
                            type="number"
                            min="0"
                            className={fieldClassName}
                            value={data.stock}
                            onChange={(event) => updateField("stock", event.target.value)}
                            placeholder="Optional"
                        />
                        <InputError message={errors.stock} />
                    </label>

                    <div className="space-y-2 md:col-span-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Sizes
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((size) => {
                                const selected = (data.sizes ?? []).includes(size.title);

                                return (
                                    <button
                                        key={size.id}
                                        type="button"
                                        onClick={() => toggleSize(size.title)}
                                        className={`min-w-10 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                            selected
                                                ? "border-[#5a3630] bg-[#5a3630] text-white"
                                                : "border-[#e1d0c8] bg-white text-[#6f4f47] hover:bg-[#fcf8f6]"
                                        }`}
                                    >
                                        {size.title}
                                    </button>
                                );
                            })}
                            {sizes.length === 0 ? (
                                <span className="text-sm text-[#8a6a55]">No sizes available</span>
                            ) : null}
                        </div>
                        <InputError message={errors.sizes} />
                    </div>

                    {/* <label className="space-y-2 md:col-span-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Image
                        </span>
                        <div
                            className={`flex min-h-40 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-white transition ${
                                data.imagePreview
                                    ? "border-[#e1d0c8]"
                                    : isDraggingImage
                                        ? "border-[#5a3630] bg-[#fcf8f6]"
                                        : "border-[#e1d0c8] hover:border-[#b78a78] hover:bg-[#fcf8f6]"
                            }`}
                            onDragEnter={() => setIsDraggingImage(true)}
                            onDragLeave={() => setIsDraggingImage(false)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={handleDrop}
                        >
                            {data.imagePreview ? (
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <img
                                        src={data.imagePreview}
                                        alt="Product preview"
                                        className="h-28 w-28 rounded-md object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        className="rounded-full border border-[#d6ccc8] bg-white px-4 py-2 text-sm font-semibold text-[#4a2b25] shadow-sm transition hover:bg-[#fcf8f6]"
                                    >
                                        Browse
                                    </button>
                                </div>
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-5 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8f4f1] text-[#7b5f58]">
                                        <ImageIcon size={26} />
                                    </div>
                                    <div className="text-sm font-semibold leading-5 text-[#5f4038]">
                                        Drag and drop the image here or browse
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            fileInputRef.current?.click();
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
                        <InputError message={errors.image} />
                    </label> */}

                    <label className="space-y-2 md:col-span-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f4f47]">
                            Image
                        </span>
                        <div
                            className={`mx-auto flex min-h-40 min-w-58 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-white transition ${
                                data.imagePreview || imageUrl
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
                            {data.imagePreview || imageUrl ? (
                                <img
                                    src={data.imagePreview || imageUrl}
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

                    <div className="mt-2 flex justify-end gap-3 md:col-span-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-full border border-[#d6ccc8] bg-white px-5 py-2.5 font-semibold text-[#4a2b25] shadow-sm transition hover:bg-[#fcf8f6] disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-[#5a3630] px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-[#4a2b25] disabled:opacity-60"
                        >
                            {processing ? "Saving..." : data.id ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
