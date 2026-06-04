import Breadcrumb from "@/Components/Breadcrumb";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { useEffect } from "react";

const createEmptyItem = () => ({
    product_id: "",
    quantity: 1,
    discount: 0,
    selected_options: [],
});

const normalizeSelectedOptions = (selectedOptions = []) => {
    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
        return [];
    }

    return selectedOptions.map((option) => ({
        product_option_id: option.product_option_id ? String(option.product_option_id) : "",
        product_option_value_id: option.product_option_value_id ? String(option.product_option_value_id) : "",
        option_label: option.option_label ?? "",
        value_label: option.value_label ?? "",
    }));
};

const normalizeItem = (item = {}) => ({
    product_id: item.product_id ? String(item.product_id) : "",
    quantity: item.quantity ?? 1,
    discount: item.discount ?? 0,
    selected_options: normalizeSelectedOptions(item.options ?? []),
});

export default function OrderCreateEdit({ datas = {}, products = [] }) {
    const initialItems =
        datas?.items?.length > 0
            ? datas.items.map((item) => normalizeItem(item))
            : [createEmptyItem()];

    const { data, setData, post, patch, errors, reset, processing } = useForm({
        order_number: datas.order_number ? datas.order_number : "",
        order_date: datas.order_date
            ? datas.order_date
            : new Date().toISOString().slice(0, 10),
        order_method: datas.order_method ? datas.order_method : "walk_in_order",
        table_number: datas.table_number ? datas.table_number : "",
        payment_method: datas.payment_method ? datas.payment_method : "cash",
        status: datas.status ? datas.status : "pending",
        notes: datas.notes ? datas.notes : "",
        items: initialItems,
    });

    const productMap = products.reduce((accumulator, product) => {
        accumulator[String(product.id)] = product;
        return accumulator;
    }, {});

    useEffect(() => {
        return () => reset();
    }, []);

    const getProductOptionSelections = (productId, existingSelections = []) => {
        const product = productMap[String(productId)];

        if (!product?.options?.length) {
            return [];
        }

        return product.options.map((option) => {
            const existingSelection = existingSelections.find(
                (selection) => String(selection.product_option_id) === String(option.id),
            );
            const selectedValueId = existingSelection?.product_option_value_id
                ? String(existingSelection.product_option_value_id)
                : "";
            const selectedValue = option.values?.find(
                (value) => String(value.id) === selectedValueId,
            );

            return {
                product_option_id: String(option.id),
                product_option_value_id: selectedValueId,
                option_label: option.name ?? "",
                value_label: selectedValue?.value ?? existingSelection?.value_label ?? "",
            };
        });
    };

    const updateItem = (index, field, value) => {
        const nextItems = [...data.items];
        const currentItem = nextItems[index] ?? createEmptyItem();

        if (field === "product_id") {
            nextItems[index] = {
                ...currentItem,
                product_id: value,
                selected_options: getProductOptionSelections(value, currentItem.selected_options),
            };
        } else {
            nextItems[index] = {
                ...currentItem,
                [field]: value,
            };
        }

        setData("items", nextItems);
    };

    const updateItemOption = (itemIndex, optionIndex, value) => {
        const nextItems = [...data.items];
        const currentItem = nextItems[itemIndex] ?? createEmptyItem();
        const product = productMap[currentItem.product_id];

        if (!product?.options?.[optionIndex]) {
            return;
        }

        const optionGroup = product.options[optionIndex];
        const selectedValue = optionGroup.values?.find(
            (optionValue) => String(optionValue.id) === String(value),
        );

        const nextSelections = [...(currentItem.selected_options ?? [])];
        nextSelections[optionIndex] = {
            product_option_id: String(optionGroup.id),
            product_option_value_id: String(value),
            option_label: optionGroup.name ?? "",
            value_label: selectedValue?.value ?? "",
        };

        nextItems[itemIndex] = {
            ...currentItem,
            selected_options: nextSelections,
        };

        setData("items", nextItems);
    };

    const addItem = () => {
        setData("items", [...data.items, createEmptyItem()]);
    };

    const removeItem = (index) => {
        if (data.items.length === 1) {
            setData("items", [createEmptyItem()]);
            return;
        }

        setData(
            "items",
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const calculateLineTotal = (item) => {
        const product = productMap[item.product_id];
        if (!product) {
            return 0;
        }

        const quantity = Number(item.quantity || 0);
        const discount = Number(item.discount || 0);
        return Math.max(Number(product.price || 0) * quantity - discount, 0);
    };

    const totalAmount = data.items.reduce(
        (sum, item) => sum + calculateLineTotal(item),
        0,
    );

    const submit = (e) => {
        e.preventDefault();

        if (!datas.id) {
            post(route("orders.store"), {
                preserveState: true,
                onSuccess: () => reset(),
            });
        } else {
            patch(route("orders.update", datas.id), {
                preserveState: true,
                onSuccess: () => reset(),
            });
        }
    };

    const headWeb = datas.id ? "Edit Order" : "Create Order";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info">
                            <div className="card-header">
                                <h3 className="card-title">Order Form</h3>
                            </div>
                            <form onSubmit={submit}>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label htmlFor="order_number">Order Number</label>
                                        <input
                                            value={data.order_number}
                                            onChange={(e) =>
                                                setData("order_number", e.target.value)
                                            }
                                            type="text"
                                            readOnly
                                            name="order_number"
                                            className={`form-control ${errors.order_number && "is-invalid"}`}
                                            id="order_number"
                                        />
                                        <InputError className="mt-2" message={errors.order_number} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="order_date">Order Date</label>
                                        <input
                                            value={data.order_date}
                                            onChange={(e) =>
                                                setData("order_date", e.target.value)
                                            }
                                            type="date"
                                            name="order_date"
                                            className={`form-control ${errors.order_date && "is-invalid"}`}
                                            id="order_date"
                                        />
                                        <InputError className="mt-2" message={errors.order_date} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="order_method">Order Method</label>
                                        <select
                                            value={data.order_method}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setData("order_method", value);
                                                if (value !== "qr_order") {
                                                    setData("table_number", "");
                                                }
                                            }}
                                            name="order_method"
                                            className={`form-control ${errors.order_method && "is-invalid"}`}
                                            id="order_method"
                                        >
                                            <option value="walk_in_order">Walk-in Order</option>
                                            <option value="qr_order">QR Order</option>
                                        </select>
                                        <InputError className="mt-2" message={errors.order_method} />
                                    </div>

                                    {data.order_method === "qr_order" && (
                                        <div className="form-group">
                                            <label htmlFor="table_number">Table Number</label>
                                            <input
                                                value={data.table_number}
                                                onChange={(e) =>
                                                    setData("table_number", e.target.value)
                                                }
                                                type="text"
                                                name="table_number"
                                                className={`form-control ${errors.table_number && "is-invalid"}`}
                                                id="table_number"
                                            />
                                            <InputError className="mt-2" message={errors.table_number} />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="payment_method">Payment Method</label>
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) =>
                                                setData("payment_method", e.target.value)
                                            }
                                            name="payment_method"
                                            className={`form-control ${errors.payment_method && "is-invalid"}`}
                                            id="payment_method"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="khqr">KHQR</option>
                                        </select>
                                        <InputError className="mt-2" message={errors.payment_method} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="status">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) =>
                                                setData("status", e.target.value)
                                            }
                                            name="status"
                                            className={`form-control ${errors.status && "is-invalid"}`}
                                            id="status"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="preparing">Preparing</option>
                                            <option value="finish">Finish</option>
                                        </select>
                                        <InputError className="mt-2" message={errors.status} />
                                    </div>

                                    <div className="form-group">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <label className="mb-0">Order Items</label>
                                            <button type="button" className="btn btn-sm btn-secondary" onClick={addItem}>
                                                Add Item
                                            </button>
                                        </div>

                                        {data.items.map((item, index) => {
                                            const selectedProduct = productMap[item.product_id];
                                            const optionGroups = selectedProduct?.options ?? [];

                                            return (
                                                <div className="border rounded p-3 mb-3" key={index}>
                                                    <div className="row">
                                                        <div className="col-md-4 mb-2">
                                                            <label>Product</label>
                                                            <select
                                                                value={item.product_id}
                                                                onChange={(e) =>
                                                                    updateItem(
                                                                        index,
                                                                        "product_id",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className={`form-control ${errors[`items.${index}.product_id`] && "is-invalid"}`}
                                                            >
                                                                <option value="">Select product</option>
                                                                {products.map((product) => (
                                                                    <option key={product.id} value={product.id}>
                                                                        {product.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <InputError className="mt-1" message={errors[`items.${index}.product_id`]} />
                                                        </div>
                                                        <div className="col-md-2 mb-2">
                                                            <label>Quantity</label>
                                                            <input
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    updateItem(
                                                                        index,
                                                                        "quantity",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                type="number"
                                                                min="1"
                                                                className={`form-control ${errors[`items.${index}.quantity`] && "is-invalid"}`}
                                                            />
                                                            <InputError className="mt-1" message={errors[`items.${index}.quantity`]} />
                                                        </div>
                                                        <div className="col-md-2 mb-2">
                                                            <label>Discount</label>
                                                            <input
                                                                value={item.discount}
                                                                onChange={(e) =>
                                                                    updateItem(
                                                                        index,
                                                                        "discount",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                type="number"
                                                                min="0"
                                                                className={`form-control ${errors[`items.${index}.discount`] && "is-invalid"}`}
                                                            />
                                                            <InputError className="mt-1" message={errors[`items.${index}.discount`]} />
                                                        </div>
                                                        <div className="col-md-2 d-flex align-items-end mb-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => removeItem(index)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {optionGroups.length > 0 && (
                                                        <div className="mt-3 border-top pt-3">
                                                            <strong>Customization Options</strong>
                                                            <div className="row g-3 mt-1">
                                                                {optionGroups.map((optionGroup, optionIndex) => {
                                                                    const currentSelection = item.selected_options?.[optionIndex] ?? {};

                                                                    return (
                                                                        <div className="col-md-4" key={optionGroup.id}>
                                                                            <label>
                                                                                {optionGroup.name}
                                                                                {optionGroup.is_required ? " *" : ""}
                                                                            </label>
                                                                            <select
                                                                                value={currentSelection.product_option_value_id ?? ""}
                                                                                onChange={(e) =>
                                                                                    updateItemOption(index, optionIndex, e.target.value)
                                                                                }
                                                                                className={`form-control ${errors[`items.${index}.selected_options.${optionIndex}.product_option_value_id`] && "is-invalid"}`}
                                                                            >
                                                                                <option value="">
                                                                                    {optionGroup.is_required ? `Select ${optionGroup.name}` : `Optional ${optionGroup.name}`}
                                                                                </option>
                                                                                {optionGroup.values.map((optionValue) => (
                                                                                    <option key={optionValue.id} value={optionValue.id}>
                                                                                        {optionValue.value}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <InputError
                                                                                className="mt-1"
                                                                                message={errors[`items.${index}.selected_options.${optionIndex}.product_option_value_id`]}
                                                                            />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mt-2 text-end">
                                                        <strong>
                                                            Line Total: ${calculateLineTotal(item).toFixed(2)}
                                                        </strong>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="form-group mt-3">
                                        <label htmlFor="notes">Notes</label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData("notes", e.target.value)}
                                            rows="3"
                                            className={`form-control ${errors.notes && "is-invalid"}`}
                                            id="notes"
                                        ></textarea>
                                        <InputError className="mt-2" message={errors.notes} />
                                    </div>

                                    <div className="mt-3 text-end">
                                        <h5>Total Amount: ${totalAmount.toFixed(2)}</h5>
                                    </div>
                                </div>
                                <div className="card-footer text-end">
                                    <PrimaryButton disabled={processing} className="me-2">
                                        {processing
                                            ? datas.id
                                                ? "Updating..."
                                                : "Saving..."
                                            : datas.id
                                              ? "Update Order"
                                              : "Save Order"}
                                    </PrimaryButton>
                                    <SecondaryButton type="button" onClick={() => history.back()}>
                                        Cancel
                                    </SecondaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
