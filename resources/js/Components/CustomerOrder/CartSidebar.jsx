import React from "react";
import { ShoppingBag, Minus, Plus, Check, Trash2 } from "lucide-react";

// Format Price Utility
const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function CartSidebar({
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
    return (
        <aside className="hidden lg:block w-96 shrink-0 h-[calc(100vh-150px)] sticky top-24 bg-white rounded-[28px] border border-[#eadfda] shadow-md flex-col overflow-hidden">
            <div className="p-4 border-b border-[#eadfda] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#5a3630]" />
                    <h3 className="font-extrabold text-[#2f1a16]">Your Order</h3>
                </div>
                <span className="text-xs bg-[#f3ede9] text-[#5a3630] font-bold px-2.5 py-1 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2 font-sans">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                        <div className="h-14 w-14 rounded-full bg-[#fcf9f7] flex items-center justify-center text-[#c07a49] mb-3 border border-dashed border-[#eadfda]">
                            <ShoppingBag size={24} />
                        </div>
                        <h4 className="font-bold text-sm text-[#2f1a16]">Order Cart is Empty</h4>
                        <p className="text-xs text-[#8b6b61] mt-1 px-4">
                            Add items from the menu to build your coffee order!
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleCheckoutSubmit} className="space-y-5 h-full flex flex-col justify-between">
                        <div className="space-y-4 flex-1">
                            {/* Cart Items List */}
                            <div className="divide-y divide-[#f3ede9] max-h-[300px] overflow-y-auto pr-1">
                                {cart.map((item) => (
                                    <div key={item.id} className="py-3 flex gap-3 items-start justify-between border-b border-[#f3ede9] last:border-b-0">
                                        <div className="min-w-0 flex-1">
                                            <h5 className="font-bold text-sm text-[#2f1a16] truncate">
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

                                        <div className="flex items-center gap-2">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2.5 shrink-0 bg-[#f3ede9] rounded-full p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="h-6 w-6 rounded-full bg-white text-[#5a3630] flex items-center justify-center shadow-sm hover:bg-gray-100 transition cursor-pointer"
                                                >
                                                    <Minus size={12} strokeWidth={2.5} />
                                                </button>
                                                <span className="text-xs font-black text-[#2f1a16] w-3 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="h-6 w-6 rounded-full bg-white text-[#5a3630] flex items-center justify-center shadow-sm hover:bg-gray-100 transition cursor-pointer"
                                                >
                                                    <Plus size={12} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                            {/* Remove item button */}
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="rounded-full text-[#5a3630] flex items-center justify-center transition cursor-pointer"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} className="hover:text-danger/70" />
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>

                            {/* Order Settings Section */}
                            <div className="border-t border-[#eadfda] pt-4 space-y-3">
                                {/* Order Type DineIn / TakeAway */}
                                <div>
                                    <label className="text-[11px] font-black uppercase text-[#8b6b61] tracking-wider block mb-1.5">
                                        Order Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 bg-[#f3ede9] p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => handleOrderTypeChange("Dine In")}
                                            className={`py-1.5 text-xs font-bold rounded-lg transition ${data.order_type === "Dine In"
                                                ? "bg-white text-[#5a3630] shadow-sm"
                                                : "text-[#8b6b61] hover:text-[#5a3630] disabled:opacity-50"
                                                }`}
                                        >
                                            Dine In
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleOrderTypeChange("Take Away")}
                                            className={`py-1.5 text-xs font-bold rounded-lg transition ${data.order_type === "Take Away"
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
                                    <label className="text-[11px] font-black uppercase text-[#8b6b61] tracking-wider block mb-1">
                                        Your Name <span className="text-[#e05a47]">(Required)</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.customer_name}
                                        onChange={(e) => setData("customer_name", e.target.value)}
                                        placeholder="Customer Name"
                                        className="w-full h-10 px-3 text-sm rounded-xl border border-[#eadfda] bg-white outline-none focus:border-[#c07a49] focus:ring-1 focus:ring-[#f3ede9]"
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
                                        <label className="text-[11px] font-black uppercase text-[#8b6b61] tracking-wider block mb-1">
                                            Phone Number <span className="text-[#e05a47]">(Required)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={data.phone_number || ""}
                                            onChange={(e) => setData("phone_number", e.target.value)}
                                            placeholder="Phone Number"
                                            className="w-full h-10 px-3 text-sm rounded-xl border border-[#eadfda] bg-white outline-none focus:border-[#c07a49] focus:ring-1 focus:ring-[#f3ede9]"
                                        />
                                        {errors.phone_number && (
                                            <span className="text-danger text-xs mt-1 block">
                                                {errors.phone_number}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Payment Methods */}
                                <div>
                                    <label className="text-[11px] font-black uppercase text-[#8b6b61] tracking-wider block mb-1.5">
                                        Payment Method
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData("payment_method", "khqr")}
                                            className={`py-2 px-3 border rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${data.payment_method === "khqr"
                                                ? "border-[#5a3630] bg-[#fcf9f7] text-[#5a3630] ring-1 ring-[#5a3630]"
                                                : "border-[#eadfda] bg-white text-gray-500 hover:bg-[#fbf8f5]"
                                                }`}
                                        >
                                            <span className="font-extrabold text-xs">KHQR Pay</span>
                                            <span className="text-[9px] mt-0.5 text-[#8b6b61]">Scan & Pay</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Actions */}
                        <div className="border-t border-[#eadfda] pt-4 bg-white space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[#8b6b61] font-semibold">Total Amount</span>
                                <span className="text-xl font-black text-[#5a3630]">${formatPrice(totalAmount)}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 bg-[#5a3630] hover:bg-[#4a2b25] text-white rounded-xl font-bold shadow-md transition transform hover:scale-[1.01] active:scale-99 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Check size={18} strokeWidth={2.5} />
                                {processing ? "Submitting Order..." : "Confirm & Send Order"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </aside>
    );
}
