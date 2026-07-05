import React from "react";
import { Coffee, ShoppingBag } from "lucide-react";

export default function GuestHeader({ setCartOpen, cart = [] }) {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#eadfda] px-4 py-3 md:px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5a3630] text-white shadow-md">
                    <Coffee size={20} className="animate-pulse" />
                </div>
                <div>
                    <h1 className="text-lg font-black tracking-tight text-[#2f1a16]">TOS SAK CAFE</h1>
                    <p className="text-[10px] uppercase tracking-widest text-[#c07a49] font-bold">
                        Self-Ordering Portal
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Cart Button (Header) */}
                <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className="relative flex items-center gap-2 rounded-full border border-[#eadfda] bg-white px-4 py-2 text-sm font-bold text-[#5a3630] shadow-sm transition hover:bg-[#fbf8f5] active:scale-95 cursor-pointer"
                >
                    <ShoppingBag size={16} />
                    <span className="hidden sm:inline">My Cart</span>
                    {cart.length > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5a3630] text-[10px] font-black text-white">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
