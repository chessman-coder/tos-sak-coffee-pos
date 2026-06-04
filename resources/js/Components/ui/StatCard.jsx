export default function StatCard({ label, value, icon }) {
    return (
        <div
            className="rounded-[26px] border border-[#eadfda] bg-card p-4 shadow-[0_12px_24px_rgba(54,37,30,0.05)]"
            style={{ boxShadow: "0 10px 24px rgba(54, 37, 30, 0.06)" }}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-bold uppercase tracking-[0.08em] text-secondary-dark">{label}</div>
                    <div className="mt-2 text-3xl font-bold text-[#2f1a16]">{value}</div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f6eeea] text-primary-light">
                    {icon}
                </div>
            </div>
        </div>
    );
}
