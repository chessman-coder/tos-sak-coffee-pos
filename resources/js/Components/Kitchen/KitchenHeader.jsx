import React from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function KitchenHeader({
    soundEnabled,
    setSoundEnabled,
    pendingCount,
    preparingCount,
    readyCount,
}) {
    return (
        <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0 bg-white p-3 md:p-3.5 rounded-2xl border border-[#EADFC8]/40 shadow-sm">
            <div>
                <h1 className="text-xl md:text-2xl font-black text-[#4B2E2B] flex items-center gap-1.5 md:gap-2">
                    Kitchen Dashboard
                </h1>
                <p className="text-[10px] md:text-xs text-[#5A3A36]/70 mt-0.5">
                    Manage and track active orders in the prep queue.
                </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                {/* Audio alert toggle */}
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`flex h-9 md:h-10 px-3 md:px-4 items-center gap-1.5 md:gap-2 rounded-xl border text-xs font-bold transition ${soundEnabled
                        ? "bg-[#FDFBF9] border-[#EADFC8] text-primary-dark"
                        : "bg-red-50 border-red-200 text-red-500"
                        }`}
                >
                    {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                    <span className="hidden sm:inline">{soundEnabled ? "Chime On" : "Chime Off"}</span>
                </button>

                {/* Status Stats Summary */}
                <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-[#F8F5F2] px-3.5 py-2 rounded-xl border border-[#EADFC8]/30">
                    <span className="text-danger">Pending: {pendingCount}</span>
                    <span className="text-[#EADFC8] mx-1">|</span>
                    <span className="text-warning">Prep: {preparingCount}</span>
                    <span className="text-[#EADFC8] mx-1">|</span>
                    <span className="text-success">Ready: {readyCount}</span>
                </div>
            </div>
        </div>
    );
}
