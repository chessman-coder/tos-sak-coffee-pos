export default function InfoBox({ label, value }) {
    return (
        <div className="rounded-2xl border border-[#eadfda] bg-white p-4">
            <div className="text-xs uppercase tracking-[0.08em] text-[#8b6d64]">{label}</div>
            <div className="mt-1 font-semibold text-[#2f1a16]">{value}</div>
        </div>
    );
}
