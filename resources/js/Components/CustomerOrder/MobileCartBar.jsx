import React from "react";
import { ShoppingBag } from "lucide-react";

// Format Price Utility
const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function MobileCartBar({ cart = [], setCartOpen, totalAmount }) {
    if (cart.length === 0) return null;

    return (
        <div className="lg:hidden fixed bottom-6 inset-x-4 z-40 bg-[#5a3630] text-white rounded-2xl py-3 px-5 shadow-xl flex items-center justify-between transition-transform transform active:scale-95 animate-fadeIn">
            <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-3 w-full justify-between"
            >
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <ShoppingBag size={20} />
                        <span className="absolute -top-2 -right-2 bg-[#c07a49] text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    </div>
                    <span className="text-sm font-extrabold tracking-tight">View My Order</span>
                </div>
                <span className="text-base font-black">${formatPrice(totalAmount)}</span>
            </button>
        </div>
    );
}
