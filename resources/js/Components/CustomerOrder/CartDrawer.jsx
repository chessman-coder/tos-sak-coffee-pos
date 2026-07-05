import React from "react";
import { ShoppingBag, X, Minus, Plus, Check } from "lucide-react";

// Format Price Utility
const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function CartDrawer({
    cartOpen,
    setCartOpen,
    cart = [],
    handleCheckoutSubmit,
    updateQuantity,
    handleOrderTypeChange,
    data,
    setData,
    processing,
    totalAmount,
    removeItem,
    errors = {},
}) {
    if (!cartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            {/* Backdrop */}
            <div
                onClick={() => setCartOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
            />

            {/* Drawer Content */}
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden animate-slideUp">
                {/* Drawer Header */}
                <div className="px-5 py-4 border-b border-[#eadfda] flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={18} className="text-[#5a3630]" />
                        <h3 className="font-extrabold text-[#2f1a16]">Your Cart</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setCartOpen(false)}
                        className="h-8 w-8 rounded-full bg-[#f3ede9] text-[#5a3630] flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-10">
                            <ShoppingBag size={32} className="text-[#c07a49] mb-2" />
                            <h4 className="font-bold text-sm">Cart is empty</h4>
                        </div>
                    ) : (
                        <form onSubmit={handleCheckoutSubmit} className="space-y-5 font-sans">
                            <div className="space-y-4">
                                {/* Cart Items List */}
                                <div className="divide-y divide-[#f3ede9]">
                                    {cart.map((item) => (
                                        <div key={item.id} className="py-3.5 flex gap-3 items-start justify-between border-b border-[#f3ede9] last:border-b-0">
                                            <div className="min-w-0 flex-1">
                                                <h5 className="font-bold text-sm text-[#2f1a16]">
                                                    {item.product.name}
                                                </h5>
                                                {(item.size || item.type || item.selected_options?.length > 0) && (
                                                    <p className="text-[11px] text-[#8b6b61] mt-0.5 space-x-1">
                                                        {item.size && <span className="bg-[#f3ede9] px-1.5 py-0.5 rounded font-medium text-[#5a3630]">{item.size}</span>}
                                                        {item.type && <span className="bg-[#f3ede9] px-1.5 py-0.5 rounded font-medium text-[#5a3630]">{item.type}</span>}
                                                        {item.selected_options.map((opt) => (
                                                            <span key={opt.product_option_value_id} className="text-[10px] bg-[#fcf9f7] border border-[#eadfda] px-1.5 py-0.5 rounded text-gray-500 inline-block mt-1">
                                                                {opt.value_label}{opt.note ? ` (${opt.note})` : ""}
                                                            </span>
                                                        ))}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <span className="text-[11px] text-[#8b6b61] block mt-1.5 italic bg-[#fcf9f7] border border-dashed border-[#eadfda] px-2 py-1 rounded-lg">
                                                        Note: {item.notes}
                                                    </span>
                                                )}
                                                <span className="text-xs font-black text-[#5a3630] block mt-1">
                                                    ${formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2.5 shrink-0 bg-[#f3ede9] rounded-full p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="h-7 w-7 rounded-full bg-white text-[#5a3630] flex items-center justify-center shadow-sm cursor-pointer"
                                                >
                                                    <Minus size={13} strokeWidth={2.5} />
                                                </button>
                                                <span className="text-xs font-black text-[#2f1a16] w-3 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="h-7 w-7 rounded-full bg-white text-[#5a3630] flex items-center justify-center shadow-sm cursor-pointer"
                                                >
                                                    <Plus size={13} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Settings */}
                                <div className="border-t border-[#eadfda] pt-4 space-y-4">
                                    {/* Order Type */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-[#8b6b61] tracking-wider block mb-1.5">
                                            Order Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 bg-[#f3ede9] p-1 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => handleOrderTypeChange("Dine In")}
                                                className={`py-2 text-xs font-bold rounded-lg transition ${data.order_type === "Dine In"
                                                    ? "bg-white text-[#5a3630] shadow-sm"
                                                    : "text-[#8b6b61] hover:text-[#5a3630] disabled:opacity-50"
                                                    }`}
                                            >
                                                Dine In
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOrderTypeChange("Take Away")}
                                                className={`py-2 text-xs font-bold rounded-lg transition ${data.order_type === "Take Away"
                                                    ? "bg-white text-[#5a3630] shadow-sm"
                                                    : "text-[#8b6b61] hover:text-[#5a3630] disabled:opacity-50"
                                                    }`}
                                            >
                                                Take Away
                                            </button>
                                        </div>
                                    </div>

                                    {/* Customer Name */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-[#8b6b61] tracking-wider block mb-1">
                                            Your Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.customer_name}
                                            onChange={(e) => setData("customer_name", e.target.value)}
                                            placeholder="e.g. Darab"
                                            className="w-full h-11 px-3 text-sm rounded-xl border border-[#eadfda] bg-white outline-none focus:border-[#c07a49]"
                                        />
                                        {errors.customer_name && (
                                            <span className="text-danger text-xs mt-1 block">
                                                {errors.customer_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    {data.order_type === "Take Away" && (
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-[#8b6b61] tracking-wider block mb-1">
                                                Phone Number <span className="text-[#e05a47]">(Required)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={data.phone_number || ""}
                                                onChange={(e) => setData("phone_number", e.target.value)}
                                                placeholder="e.g. 012345678"
                                                className="w-full h-11 px-3 text-sm rounded-xl border border-[#eadfda] bg-white outline-none focus:border-[#c07a49]"
                                            />
                                            {errors.phone_number && (
                                                <span className="text-danger text-xs mt-1 block">
                                                    {errors.phone_number}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Order Notes removed since notes are now per order item */}

                                    {/* Payments */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-[#8b6b61] tracking-wider block mb-1.5">
                                            Payment Method
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setData("payment_method", "khqr")}
                                                className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${data.payment_method === "khqr"
                                                    ? "border-[#5a3630] bg-[#fcf9f7] text-[#5a3630] ring-1 ring-[#5a3630]"
                                                    : "border-[#eadfda] bg-white text-gray-500"
                                                    }`}
                                            >
                                                <span className="font-extrabold text-xs">KHQR Pay</span>
                                                <span className="text-[9px] mt-0.5 text-[#8b6b61]">Scan & Pay</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData("payment_method", "cash")}
                                                className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${data.payment_method === "cash"
                                                    ? "border-[#5a3630] bg-[#fcf9f7] text-[#5a3630] ring-1 ring-[#5a3630]"
                                                    : "border-[#eadfda] bg-white text-gray-500"
                                                    }`}
                                            >
                                                <span className="font-extrabold text-xs">Pay at Counter</span>
                                                <span className="text-[9px] mt-0.5 text-[#8b6b61]">Pay cash</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer actions */}
                            <div className="border-t border-[#eadfda] pt-4 space-y-3 bg-white pb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#8b6b61] font-semibold">Total Amount</span>
                                    <span className="text-xl font-black text-[#5a3630]">${formatPrice(totalAmount)}</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full h-12 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-xl font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Check size={18} strokeWidth={2.5} />
                                    {processing ? "Submitting Order..." : "Confirm & Send Order"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
