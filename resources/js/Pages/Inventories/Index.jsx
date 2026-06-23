import { useEffect, useMemo, useState } from "react";
import {
    CircleAlert,
    Eye,
    History,
    Minus,
    Package,
    Plus,
    Search,
    SquarePen,
    Trash2,
} from "lucide-react";
import InventoryFormModal from "@/Components/Inventories/InventoryFormModal";
import InventoryHistoryPanel from "@/Components/Inventories/InventoryHistoryPanel";
import InventoryMovementModal from "@/Components/Inventories/InventoryMovementModal";
import DetailModal from "@/Components/UI/DetailModal";
import InventoryList from "@/Components/Inventories/InventoryList";
import StatCard from "@/Components/UI/StatCard";
import Button from "@/Components/ui/Button";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, usePage } from "@inertiajs/react";

function normalizeInventory(inventory) {
    return {
        id: inventory.id,
        name: inventory.name ?? "",
        category: inventory.category ?? "",
        imagePath: inventory.image_path ?? "",
        imageUrl: inventory.image_path ? `/storage/${inventory.image_path}` : "",
        unit: inventory.unit ?? "",
        stock: Number(inventory.stock ?? 0),
        reorderLevel: Number(inventory.reorder_level ?? 0),
        unitCost: Number(inventory.unit_cost ?? 0),
        supplier: inventory.supplier ?? "",
    };
}

function normalizeMovement(movement) {
    return {
        id: movement.id,
        itemId: movement.inventory_id,
        itemName: movement.inventory?.name ?? "Inventory item",
        type: movement.direction,
        quantity: Number(movement.quantity ?? 0),
        admin: movement.user?.name ?? movement.admin_name ?? "Admin",
        note: movement.note ?? "",
        time: movement.created_at ?? "Just now",
    };
}

const emptyForm = {
    name: "",
    category: "",
    image: null,
    imagePreview: "",
    unit: "",
    stock: "0",
    reorderLevel: "0",
    unitCost: "0",
    supplier: "",
};

export default function InventoryPage({ inventories = [], movements = [] }) {
    const headWeb = "Inventory Management";
    const [items, setItems] = useState(() =>
        inventories.map(normalizeInventory),
    );
    const [history, setHistory] = useState(() =>
        movements.map(normalizeMovement),
    );
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [itemForm, setItemForm] = useState(emptyForm);
    const [editingItemId, setEditingItemId] = useState(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemSubmitting, setItemSubmitting] = useState(false);
    const [movementState, setMovementState] = useState(null);
    const [movementQuantity, setMovementQuantity] = useState("1");
    const [movementNote, setMovementNote] = useState("");
    const user = usePage().props.auth.user;

    const [movementSubmitting, setMovementSubmitting] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        setItems(inventories.map(normalizeInventory));
    }, [inventories]);

    useEffect(() => {
        setHistory(movements.map(normalizeMovement));
    }, [movements]);

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        return items.filter((item) => {
            const lowStock = item.stock > 0 && item.stock <= item.reorderLevel;
            const outOfStock = item.stock === 0;
            const matchesFilter =
                filter === "all" ||
                (filter === "low" && lowStock) ||
                (filter === "out" && outOfStock);

            const matchesCategory =
                categoryFilter === "all" ||
                item.category.toLowerCase() === categoryFilter.toLowerCase();

            const matchesQuery =
                !query ||
                [item.name, item.category, item.supplier]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(query));

            return matchesFilter && matchesCategory && matchesQuery;
        });
    }, [categoryFilter, filter, items, search]);

    const stats = useMemo(() => {
        const lowStockCount = items.filter(
            (item) => item.stock > 0 && item.stock <= item.reorderLevel,
        ).length;
        const outOfStockCount = items.filter((item) => item.stock === 0).length;
        const inventoryValue = items.reduce(
            (total, item) => total + item.stock * item.unitCost,
            0,
        );

        return {
            totalItems: items.length,
            lowStockCount,
            outOfStockCount,
            inventoryValue,
        };
    }, [items]);

    const categoryOptions = useMemo(
        () =>
            [
                ...new Set(
                    items.map((item) => item.category.trim()).filter(Boolean),
                ),
            ].sort((left, right) => left.localeCompare(right)),
        [items],
    );

    const unitOptions = useMemo(
        () =>
            [
                ...new Set(
                    items.map((item) => item.unit.trim()).filter(Boolean),
                ),
            ].sort((left, right) => left.localeCompare(right)),
        [items],
    );

    const supplierOptions = useMemo(
        () =>
            [
                ...new Set(
                    items.map((item) => item.supplier.trim()).filter(Boolean),
                ),
            ].sort((left, right) => left.localeCompare(right)),
        [items],
    );

    function openCreateItem() {
        setEditingItemId(null);
        setItemForm(emptyForm);
        setIsItemModalOpen(true);
    }

    function openEditItem(item) {
        setEditingItemId(item.id);
        setItemForm({
            name: item.name,
            category: item.category,
            image: null,
            imagePreview: item.imageUrl,
            unit: item.unit,
            stock: String(item.stock),
            reorderLevel: String(item.reorderLevel),
            unitCost: String(item.unitCost),
            supplier: item.supplier,
        });
        setIsItemModalOpen(true);
    }

    function closeItemModal() {
        if (itemSubmitting) return;

        setIsItemModalOpen(false);
        setEditingItemId(null);
        setItemForm(emptyForm);
    }

    async function handleSaveItem(event) {
        event.preventDefault();

        const payload = {
            name: itemForm.name.trim(),
            category: itemForm.category.trim(),
            unit: itemForm.unit.trim(),
            stock: Number(itemForm.stock) || 0,
            reorder_level: Number(itemForm.reorderLevel) || 0,
            unit_cost: Number(itemForm.unitCost) || 0,
            supplier: itemForm.supplier.trim(),
        };

        if (itemForm.image) {
            payload.image = itemForm.image;
        }

        if (!payload.name) {
            return;
        }

        setItemSubmitting(true);

        const endpoint = editingItemId
            ? route("inventories.update", editingItemId)
            : route("inventories.store");

        const method = editingItemId ? "patch" : "post";
        
        // If there's a file, build FormData manually to ensure proper multipart encoding
        if (itemForm.image) {
            const fd = new FormData();
            fd.append("name", payload.name);
            fd.append("category", payload.category);
            fd.append("unit", payload.unit);
            fd.append("stock", String(payload.stock));
            fd.append("reorder_level", String(payload.reorder_level));
            fd.append("unit_cost", String(payload.unit_cost));
            fd.append("supplier", payload.supplier);
            fd.append("image", itemForm.image);

            // When using FormData for PATCH, include _method override so Laravel recognizes it
            if (method === "patch") {
                fd.append("_method", "patch");
            }

            router.post(endpoint, fd, {
                preserveScroll: true,
                onSuccess: () => {
                    closeItemModal();
                    router.reload({
                        only: ["inventories", "movements"],
                        preserveScroll: true,
                    });
                },
                onError: (errors) => {
                    console.error("Save item errors:", errors);
                },
                onFinish: () => setItemSubmitting(false),
            });
        } else {
            router[method](endpoint, payload, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    closeItemModal();
                    router.reload({
                        only: ["inventories", "movements"],
                        preserveScroll: true,
                    });
                },
                onError: (errors) => {
                    console.error("Save item errors:", errors);
                },
                onFinish: () => setItemSubmitting(false),
            });
        }
    }

    function openMovementModal(item, direction) {
        setMovementState({ item, direction });
        setMovementQuantity("1");
        setMovementNote("");
    }

    function closeMovementModal() {
        if (movementSubmitting) return;

        setMovementState(null);
    }

    async function handleMovementSubmit(event) {
        event.preventDefault();

        if (!movementState) return;

        const movementAmount = Number(movementQuantity) || 0;
        if (movementAmount <= 0) return;

        try {
            setMovementSubmitting(true);

            router.post(
                route("inventories.movements.store", movementState.item.id),
                {
                    direction: movementState.direction,
                    quantity: movementAmount,
                    note: movementNote.trim(),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        closeMovementModal();
                        router.reload({
                            only: ["inventories", "movements"],
                            preserveScroll: true,
                        });
                    },
                },
            );
        } finally {
            setMovementSubmitting(false);
        }
    }

    function handleDeleteItem(item) {
        const confirmed = window.confirm(`Delete ${item.name}?`);

        if (!confirmed) return;

        router.delete(route("inventories.destroy", item.id), {
            preserveScroll: true,
            onSuccess: () =>
                router.reload({
                    only: ["inventories", "movements"],
                    preserveScroll: true,
                }),
        });
    }

    const recentHistory = history.slice(0, 6);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value);

    const formatValue = (item) => formatCurrency(item.stock * item.unitCost);

    return (
        <AdminLayout>
            <Head title={headWeb} />
            <section className="min-h-screen bg-background px-4 py-6 md:px-6 lg:px-8">
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Items"
                            value={stats.totalItems}
                            icon={<Package size={22} />}
                        />
                        <StatCard
                            label="Inventory Value"
                            value={formatCurrency(stats.inventoryValue)}
                            icon={
                                <span className="text-2xl font-semibold">
                                    $
                                </span>
                            }
                        />
                        <StatCard
                            label="Low Stock"
                            value={stats.lowStockCount}
                            icon={<CircleAlert size={22} />}
                        />
                        <StatCard
                            label="Out of Stock"
                            value={stats.outOfStockCount}
                            icon={<History size={22} />}
                        />
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-bold text-primary-dark">
                                Inventory items
                            </h1>
                            <p className="text-sm text-[#7b5f58] md:text-base">
                                Track stock levels, cost, reorder points, and
                                admin stock movement history.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <label className="relative block w-full m-0 sm:w-80">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full rounded-full border border-card-border py-2 pl-10 pr-4 text-sm text-primary-light shadow-sm outline-none transition focus:border-secondary-dark focus:ring-2 focus:ring-card-border"
                                />
                            </label>

                            <Button
                                type="button"
                                variant="fillDark"
                                onClick={openCreateItem}
                                className="inline-flex items-center rounded-full px-4 py-2"
                            >
                                <Plus size={18} />
                                Add item
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-[#e1d0c8] bg-white px-2 text-primary-light shadow-sm">
                            <select
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value)
                                }
                                className="bg-transparent text-sm font-semibold border-none appearance-none outline-none focus:ring-0"
                            >
                                <option value="all">All categories</option>
                                {categoryOptions.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {[
                            { key: "all", label: "All items" },
                            {
                                key: "low",
                                label: `Low (${stats.lowStockCount})`,
                            },
                            {
                                key: "out",
                                label: `Out (${stats.outOfStockCount})`,
                            },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setFilter(tab.key)}
                                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                    filter === tab.key
                                        ? "border-[#5a3630] bg-[#5a3630] text-white"
                                        : "border-[#e1d0c8] bg-white text-[#5a3630] hover:bg-[#fcf8f6]"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <InventoryList
                        filteredItems={filteredItems}
                        formatCurrency={formatCurrency}
                        formatValue={formatValue}
                        openMovementModal={openMovementModal}
                        onViewItem={(item) => setSelectedItem(item)}
                        onEditItem={openEditItem}
                        onDeleteItem={handleDeleteItem}
                    />

                    <InventoryHistoryPanel history={recentHistory} />
                </div>

                <InventoryFormModal
                    show={isItemModalOpen}
                    title={
                        editingItemId
                            ? "Edit inventory item"
                            : "Add inventory item"
                    }
                    form={itemForm}
                    setForm={setItemForm}
                    imageUrl={editingItemId ? itemForm.imagePreview : ""}
                    categoryOptions={categoryOptions}
                    unitOptions={unitOptions}
                    supplierOptions={supplierOptions}
                    onClose={closeItemModal}
                    onSubmit={handleSaveItem}
                    isSubmitting={itemSubmitting}
                />

                <InventoryMovementModal
                    show={Boolean(movementState)}
                    item={movementState?.item}
                    direction={movementState?.direction}
                    quantity={movementQuantity}
                    setQuantity={setMovementQuantity}
                    note={movementNote}
                    setNote={setMovementNote}
                    onClose={closeMovementModal}
                    onSubmit={handleMovementSubmit}
                    isSubmitting={movementSubmitting}
                />

                {selectedItem && (
                    <DetailModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        history={history
                            .filter((entry) => entry.itemId === selectedItem.id)
                            .slice(0, 5)}
                    />
                )}
            </section>
        </AdminLayout>
    );
}
