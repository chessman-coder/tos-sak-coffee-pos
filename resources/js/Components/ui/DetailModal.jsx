import InfoBox from "@/Components/UI/InfoBox";
import { usePage } from "@inertiajs/react";
import { X } from "lucide-react";

export default function DetailModal({ item, history, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
            <div className="w-full max-w-2xl rounded-[28px] border border-[#eadfda] bg-[#f8f4f1] p-5 md:p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-[#eadfda] bg-white">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : null}
                        </div>
                        <div>
                            <h3 className="mb-1 text-3xl font-bold text-[#2f1a16]">
                                {item.name}
                            </h3>
                            <p className="mb-0 text-sm text-[#7b5f58]">
                                {item.category}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-[#e1d0c8] bg-white p-2 text-xl leading-none text-[#7b5f58]"
                    >
                        <X />
                    </button>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <InfoBox
                        label="Stock"
                        value={`${item.stock} ${item.unit}`}
                    />
                    <InfoBox
                        label="Reorder"
                        value={`${item.reorderLevel} ${item.unit}`}
                    />
                    <InfoBox
                        label="Cost"
                        value={new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(item.unitCost)}
                    />
                    <InfoBox label="Supplier" value={item.supplier} />
                </div>

                <div className="mt-5 rounded-3xl border border-[#eadfda] bg-white p-4">
                    <div className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#8b6d64]">
                        Recent history
                    </div>
                    <div className="space-y-3">
                        {history.length === 0 ? (
                            <div className="text-sm text-[#7b5f58]">
                                No movement recorded for this item yet.
                            </div>
                        ) : (
                            history.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between gap-3 text-sm"
                                >
                                    <div>
                                        <div
                                            className={`font-semibold ${
                                                entry.type === "in"
                                                    ? "text-success"
                                                    : "text-warning"
                                            }`}
                                        >
                                            {entry.type === "in"
                                                ? "Stock in"
                                                : "Stock out"}
                                        </div>
                                        <div >
                                            {formatEntryTime(entry.time)}
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold text-primary-light">
                                        {entry.quantity}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatEntryTime(time) {
    const user = usePage().props.auth.user;

    if (!time) return null;

    if (time === "Just now") {
        return <div className="text-xs text-primary-light">Just now</div>;
    }

    // Normalize common server timestamp formats to an ISO-like string
    let normalized = String(time).trim();
    // If it's like "YYYY-MM-DD HH:MM:SS", convert the space to 'T' for Date parsing
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
        normalized = normalized.replace(" ", "T");
    }

    const d = new Date(normalized);
    if (isNaN(d))
        return <div className="text-xs text-primary-light">{time}</div>;

    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const timeStr = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

    return (
        <div className="text-xs font-bold text-primary-light leading-tight">
            <div className="pb-1">
                {`${day} ${month} ${year}`}, {timeStr} · {user?.name ?? "Staff"}
            </div>
        </div>
    );
}
