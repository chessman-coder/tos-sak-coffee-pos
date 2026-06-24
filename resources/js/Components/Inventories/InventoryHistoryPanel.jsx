import { usePage } from "@inertiajs/react";
import Badge from "../ui/Badge";

export default function InventoryHistoryPanel({ history }) {
    function formatEntryTime(time) {
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
            <div className="text-xs text-primary-light leading-tight">
                <div className="pb-1">{`${day} ${month} ${year}`}</div>
                <div>{timeStr}</div>
            </div>
        );
    }

    const user = usePage().props.auth.user;

    return (
        <section className="rounded-[28px] border border-[#eadfda] bg-[#f8f4f1] p-5 md:p-6 shadow-[0_18px_40px_rgba(54,37,30,0.06)]">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="mb-1 text-2xl font-bold text-[#2f1a16]">
                        Stock history
                    </h3>
                    <p className="mb-0 text-sm text-secondary-dark">
                        Recent stock in and stock out activity recorded by
                        admin.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[#eadfda] bg-white">
                {history.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-secondary-dark">
                        No history yet.
                    </div>
                ) : (
                    <table className="w-full table-auto text-sm text-[#5f4038]">
                        <thead className="bg-[#fbf8f6] text-xs font-semibold uppercase tracking-[0.08em] text-[#8b6d64]">
                            <tr>
                                <th className="px-4 py-3 text-left w-[18%]">
                                    Time
                                </th>
                                <th className="px-4 py-3 text-left">Item</th>
                                <th className="px-4 py-3 text-left w-[20%]">
                                    Action
                                </th>
                                <th className="px-4 py-3 text-left w-[8%]">
                                    Qty
                                </th>
                                <th className="px-4 py-3 text-left w-[20%]">
                                    Staff Name
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#eadfda]">
                            {history.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className="odd:bg-white even:bg-[#fffaf8]"
                                >
                                    <td className="px-4 py-4">
                                        {formatEntryTime(entry.time)}
                                    </td>
                                    <td className="px-4 py-4 font-semibold">
                                        {entry.itemName}
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge
                                            variant={
                                                entry.type === "in"
                                                    ? "success"
                                                    : "warning"
                                            }
                                        >
                                            {entry.type === "in"
                                                ? "Stock in"
                                                : "Stock out"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 font-semibold">
                                        {entry.quantity}
                                    </td>
                                    <td className="px-4 py-4 text-xs text-[#8b6d64]">
                                        {user?.name ?? "Staff"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
