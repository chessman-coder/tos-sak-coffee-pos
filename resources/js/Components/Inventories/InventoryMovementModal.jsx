import Modal from "@/Components/Modal";
import { usePage } from "@inertiajs/react";
import { X } from "lucide-react";

const inputClassName =
    "w-full rounded-2xl border border-[#d9c7bf] resize-none bg-white px-4 py-3 text-sm text-[#2f1a16] outline-none transition focus:border-[#b78a78] focus:ring-2 focus:ring-[#edd9cf]";

export default function InventoryMovementModal({
    show,
    item,
    direction,
    quantity,
    setQuantity,
    note,
    setNote,
    onClose,
    onSubmit,
    isSubmitting,
}) {
    if (!show || !item) return null;

    const isStockIn = direction === "in";
    const user = usePage().props.auth.user;

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg" backdropClassName="bg-black/35">
            <div className="rounded-[28px] border border-[#eadfda] bg-[#f8f4f1] p-5 md:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="mb-1 text-3xl font-bold text-[#2f1a16]">
                            {isStockIn ? "Stock in" : "Stock out"}
                        </h2>
                        <p className="mb-0 text-sm text-secondary-dark">
                            Record movement for {item.name} and keep the history updated.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-[#e1d0c8] bg-white p-2 text-xl leading-none text-secondary-dark"
                    >
                        <X />
                    </button>
                </div>

                <div className="mb-4 rounded-2xl border border-[#eadfda] bg-white p-4 text-sm text-primaryColor">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div>
                            <span className="block text-xs uppercase tracking-[0.08em] text-primary-light">Current stock</span>
                            <strong>
                                {item.stock} {item.unit}
                            </strong>
                        </div>
                        <div>
                            <span className="block text-xs uppercase tracking-[0.08em] text-primary-light">Staff Name</span>
                            <strong>{user?.name ?? "Staff"}</strong>
                        </div>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-primary-light">Quantity</span>
                        <input
                            type="number"
                            min="1"
                            className={inputClassName}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="1"
                        />
                    </label>

                    {/* Admin is the authenticated user; no manual input required */}

                    <label className="space-y-2 md:col-span-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-primary-light">Note</span>
                        <textarea
                            rows="4"
                            className={inputClassName}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={isStockIn ? "Received from supplier" : "Used for production / adjustment"}
                        />
                    </label>

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
                            {isSubmitting ? "Saving..." : isStockIn ? "Record stock in" : "Record stock out"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
