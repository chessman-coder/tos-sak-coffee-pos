import Breadcrumb from "@/Components/Breadcrumb";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import ProductTable from "@/Components/Products/ProductTable";
import ProductFormModal from "@/Components/Products/ProductFormModal";
import ProductViewModal from "@/Components/Products/ProductViewModal";
import SecondaryButton from "@/Components/SecondaryButton";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

const splitSizes = (value) => {
    if (!value) return [];

    return String(value)
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean);
};

const splitTypes = (value) => {
    if (!value) return [];

    return String(value)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
};

const normalizeOptions = (options = []) => {
    if (!Array.isArray(options)) return [];

    return options.map((option) => ({
        id: option.id ?? null,
        name: option.name ?? "",
        is_required: Boolean(option.is_required),
        values:
            option.values?.length > 0
                ? option.values.map((value) => ({
                    id: value.id ?? null,
                    value: value.value ?? "",
                }))
                : [],
    }));
};

const emptyProductForm = {
    id: null,
    name: "",
    parent_category_id: "",
    category_id: "",
    types: [],
    price: "",
    stock: "",
    sizes: [],
    image: null,
    imagePreview: "",
    options: [],
    _method: "",
};

export default function ProductsPage({
    productData,
    categories = [],
    subCategories = [],
    types = [],
    sizes = [],
    queryParams = {},
}) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};
    const datasList = productData.data ?? [];
    const [search, setSearch] = useState("");
    const [showProductForm, setShowProductForm] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});
    const [viewingProduct, setViewingProduct] = useState(null);

    const openViewProductModal = (product) => {
        setViewingProduct(product);
    };

    const closeViewProductModal = () => {
        setViewingProduct(null);
    };

    const handleSort = (field, order) => {
        router.get(
            route("products.index"),
            {
                ...queryParams,
                sort_by: field,
                sort_order: order,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const {
        data: deleteData,
        setData: setDeleteData,
        delete: destroy,
        processing,
        reset,
        clearErrors,
    } = useForm({ id: "", name: "" });

    const {
        data: productForm,
        setData: setProductForm,
        post: submitProductForm,
        processing: productProcessing,
        errors: productErrors,
        reset: resetProductForm,
        clearErrors: clearProductErrors,
    } = useForm(emptyProductForm);

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return datasList;

        return datasList.filter((product) => {
            return [
                product?.name,
                product?.category?.name,
                product?.price,
                product?.stock,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term));
        });
    }, [datasList, search]);

    const confirmDataDeletion = (data) => {
        setDataEdit(data);
        setDeleteData("id", data.id);
        setDeleteData("name", data.name);
        setConfirmingDataDeletion(true);
    };

    const openCreateProductForm = () => {
        clearProductErrors();
        setProductForm(emptyProductForm);
        setShowProductForm(true);
    };

    const openEditProductForm = (product) => {
        clearProductErrors();
        setProductForm({
            id: product.id,
            name: product.name ?? "",
            parent_category_id: product.category?.parent_id ?? "",
            category_id: product.category_id ?? "",
            types: splitTypes(product.type),
            price: product.price ?? "",
            stock: product.stock ?? "",
            sizes: splitSizes(product.size),
            image: null,
            imagePreview: product.image_path ? `/storage/${product.image_path}` : "",
            options: normalizeOptions(product.options ?? []),
            _method: "patch",
        });
        setShowProductForm(true);
    };

    const closeProductForm = () => {
        setShowProductForm(false);
        clearProductErrors();
        resetProductForm();
    };

    const saveProduct = (event) => {
        event.preventDefault();

        const url = productForm.id
            ? route("products.update", productForm.id)
            : route("products.store");

        submitProductForm(url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => closeProductForm(),
        });
    };

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({});
        clearErrors();
        reset();
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        if (!dataEdit?.id) return;
        destroy(route("products.destroy", dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const headWeb = "Products";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout >
            <section className="min-h-screen bg-background px-4 py-6 md:px-6 lg:px-8">
                <div className="p-4 md:p-7">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-bold text-primary-dark">
                                Products
                            </h1>
                            <p className="text-sm text-secondary-dark">
                                {productData.total ?? datasList.length} items in catalog
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <label className="relative mb-0">
                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary-dark"
                                />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search..."
                                    className="h-11 w-full rounded-full border border-[#e1d0c8] bg-white pl-11 pr-4 text-sm text-[#2f1a16] shadow-sm outline-none transition focus:border-[#b78a78] focus:ring-2 focus:ring-[#edd9cf] sm:w-64"
                                />
                            </label>

                            {can["Manage Product"] && (
                            <button
                                type="button"
                                onClick={openCreateProductForm}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#5a3630] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#4a2b25]"
                            >
                                <Plus size={18} />
                                Add Product
                            </button>
                            )}
                        </div>
                    </div>

                    <ProductTable
                        products={filteredProducts}
                        canView={true}
                        canEdit={Boolean(can["Manage Product"])}
                        canDelete = {
                                Boolean(can["Manage Product"])}
                                    onView = { openViewProductModal }
                        onEdit = { openEditProductForm }
                        onDelete = { confirmDataDeletion }
                        sortBy = { queryParams.sort_by ?? "created_at" }
                        sortOrder = { queryParams.sort_order ?? "desc" }
                        onSort = { handleSort }
                                        />

                                        <div className="mt-6">
                                            <Pagination links={productData.links} />
                                        </div>
                </div>

                <Modal show={confirmingDataDeletion} onClose={closeModal}>
                    <form onSubmit={deleteDataRow} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            Confirmation!
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Are you sure you want to delete{" "}
                            <span className="text-lg font-medium">
                                {deleteData.name}
                            </span>
                            ?
                        </p>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton type="button" onClick={closeModal}>
                                No
                            </SecondaryButton>
                            <DangerButton className="ms-3" disabled={processing}>
                                Yes
                            </DangerButton>
                        </div>
                    </form>
                </Modal>

                <ProductFormModal
                    show={showProductForm}
                    title={productForm.id ? "Edit Product" : "Add Product"}
                    data={productForm}
                    setData={setProductForm}
                    errors={productErrors}
                    categories={categories}
                    subCategories={subCategories}
                    types={types}
                    sizes={sizes}
                    onClose={closeProductForm}
                    onSubmit={saveProduct}
                    processing={productProcessing}
                />

                <ProductViewModal
                    show={Boolean(viewingProduct)}
                    product={viewingProduct}
                    onClose={closeViewProductModal}
                />
            </section>
        </AdminLayout>
    );
}
