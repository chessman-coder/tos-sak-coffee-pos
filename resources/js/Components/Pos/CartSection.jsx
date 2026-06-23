import React from "react";
import {
    ShoppingBag,
    Trash2,
    Minus,
    Plus,
    Percent,
    Coins,
    QrCode,
    ShoppingCart
} from "lucide-react";

const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function CartSection({
    activeTab,
    cart = [],
    clearCart,
    removeCartItem,
    updateQuantity,
    updateItemDiscount,
    handleSubmit,
    errors = {},
    data = {},
    setData,
    processing,
    subtotal,
    discountTotal,
    totalAmount,
}) {
    return (
        <aside className={`w-full lg:w-96 max-md:w-full border-t lg:border-t-0 lg:border-l border-[#eadfda] bg-white flex flex-col min-h-0 lg:h-full shadow-lg shrink-0 overflow-y-auto lg:overflow-hidden ${activeTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
            {/* Cart Header */}
            <header className="px-6 py-3 border-b border-[#eadfda] flex items-center justify-between bg-[#fbf8f5]">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="text-[#5a3630]" size={20} />
                    <h2 className="text-lg font-bold text-[#2f1a16]">Cart Items</h2>
                    <span className="bg-[#eee4de] text-[#7b5f58] rounded-full text-xs font-bold px-2.5 py-0.5">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                </div>
                {cart.length > 0 && (
                    <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs font-bold text-danger hover:text-danger/50 transition"
                    >
                        Clear All
                    </button>
                )}
            </header>

            {/* Cart Items List */}
            <div className="flex-1 lg:overflow-y-auto p-4 space-y-3 overflow-visible lg:h-0">
                {cart.length > 0 ? (
                    cart.map((item) => (
                        <article
                            key={item.id}
                            className="p-3 bg-[#fcf9f7] rounded-2xl border border-[#eadfda] flex flex-col gap-2 relative group hover:border-[#c07a49] transition shadow-[0_4px_12px_rgba(54,37,30,0.02)]"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    {/* Product Mini Image */}
                                    <div className="w-12 h-12 rounded-xl bg-[#eee4de] overflow-hidden shrink-0 flex items-center justify-center">
                                        {item.product.image_path ? (
                                            <img
                                                src={`/storage/${item.product.image_path}`}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ShoppingBag size={18} className="text-[#7b5f58]" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-bold text-[#2f1a16] truncate pr-4">
                                            {item.product.name}
                                        </h4>
                                        <div className="text-xs font-semibold text-[#c07a49] mt-0.5">
                                            ${formatPrice(item.price)}
                                        </div>                                             {/* Chosen options tags */}
                                        {(item.size || item.selected_options.length > 0) && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.size && (
                                                    <span className="text-[9px] bg-[#eee4de] border border-[#eadfda] text-[#5a3630] px-1.5 py-0.5 rounded-md font-bold">
                                                        Size: {item.size}
                                                    </span>
                                                )}
                                                {item.selected_options.map((opt) => (
                                                    <span
                                                        key={opt.product_option_value_id}
                                                        className="text-[9px] bg-white border border-[#eadfda] text-[#7b5f58] px-1.5 py-0.5 rounded-md font-semibold"
                                                    >
                                                        {opt.option_label}: {opt.value_label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeCartItem(item.id)}
                                    className="top-2 right-2 text-[#7b5f58] hover:text-red-600 transition"
                                    aria-label="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Line item sub-actions (Qty & Discount) */}
                            <div className="flex items-center gap-4 mt-1 border-t border-[#f3ede9] pt-2">
                                <div className="flex items-center rounded-lg border border-[#eadfda] bg-white">
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="p-1 hover:bg-[#fbf8f5] rounded-l-lg text-[#7b5f58]"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-[#2f1a16]">
                                        {item.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="p-1 hover:bg-[#fbf8f5] rounded-r-lg text-[#7b5f58]"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>

                                {/* Line Discount input */}
                                <div className="flex items-center gap-1.5">
                                    <Percent size={12} className="text-[#c07a49]" />
                                    <input
                                        type="number"
                                        value={item.discount}
                                        onChange={(e) =>
                                            updateItemDiscount(item.id, e.target.value)
                                        }
                                        placeholder="dis"
                                        min="0"
                                        max="100"
                                        className="w-16 h-7 bg-white rounded border border-[#eadfda] text-center text-xs text-[#2f1a16] focus:border-[#c07a49] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="text-sm font-bold text-[#2f1a16] shrink-0">
                                ${formatPrice((item.price * item.quantity) * (1 - (Number(item.discount || 0) / 100)))}
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-[#7b5f58]">
                        <ShoppingBag size={36} className="text-[#c07a49] mb-2" />
                        <p className="text-sm font-medium">Cart is empty</p>
                        <p className="text-xs mt-1">Add items to proceed</p>
                    </div>
                )}
            </div>

            {/* Checkout Details Form */}
            <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-[#eadfda] bg-[#fbf8f5] space-y-4 shadow-inner"
            >
                {/* Validation Errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
                        <strong>Error completing checkout:</strong>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5">
                            {Object.values(errors).map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Order Method, Type and Payment */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-bold text-[#7b5f58] uppercase tracking-wider block mb-1">
                            Order Type
                        </label>
                        <div className="grid grid-cols-2 rounded-md bg-[#eee4de] p-0.5">
                            <button
                                type="button"
                                onClick={() => setData("order_type", "Dine In")}
                                className={`h-7 text-xs font-bold rounded transition ${data.order_type === "Dine In"
                                    ? "bg-[#5a3630] text-white"
                                    : "text-[#5a3630]"
                                    }`}
                            >
                                Dine In
                            </button>
                            <button
                                type="button"
                                onClick={() => setData("order_type", "Take Away")}
                                className={`h-7 text-xs font-bold rounded transition ${data.order_type === "Take Away"
                                    ? "bg-[#5a3630] text-white"
                                    : "text-[#5a3630]"
                                    }`}
                            >
                                Take Away
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#7b5f58] uppercase tracking-wider block mb-1">
                            Payment
                        </label>
                        <div className="grid grid-cols-2 rounded-md bg-[#eee4de] p-0.5">
                            <button
                                type="button"
                                onClick={() => setData("payment_method", "cash")}
                                className={`h-7 text-xs font-bold rounded transition flex items-center justify-center gap-1 ${data.payment_method === "cash"
                                    ? "bg-[#5a3630] text-white"
                                    : "text-[#5a3630]"
                                    }`}
                            >
                                <Coins size={14} />
                                Cash
                            </button>
                            <button
                                type="button"
                                onClick={() => setData("payment_method", "qr pay")}
                                className={`h-7 text-xs font-bold rounded transition flex items-center justify-center gap-1 ${data.payment_method === "qr pay"
                                    ? "bg-[#5a3630] text-white"
                                    : "text-[#5a3630]"
                                    }`}
                            >
                                <QrCode size={14} />
                                QR Pay
                            </button>
                        </div>
                    </div>
                </div>

                {/* Order Notes */}
                <div>
                    <label className="text-[11px] font-bold text-[#7b5f58] uppercase tracking-wider block mb-1">
                        Order Notes (Optional)
                    </label>
                    <input
                        type="text"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        placeholder="Add notes for this order..."
                        className="w-full h-8 px-2.5 bg-white border border-[#eadfda] rounded-md text-xs text-[#2f1a16] focus:border-[#c07a49] focus:outline-none"
                    />
                </div>

                {/* Pricing Breakdowns */}
                <div className="border-t border-[#eadfda] pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-[#7b5f58] font-semibold">
                        <span>Subtotal</span>
                        <span>${formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#7b5f58] font-semibold">
                        <span>Line Discount</span>
                        <span>-${formatPrice(discountTotal)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-[#2f1a16] pt-1.5 border-t border-dashed border-[#eadfda]">
                        <span>Payable Total</span>
                        <span>${formatPrice(totalAmount)}</span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing || cart.length === 0}
                    className="w-full h-12 bg-[#5a3630] hover:bg-[#4a2b25] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-bold shadow-md transition flex items-center justify-center gap-2 mt-4"
                >
                    <ShoppingCart size={18} />
                    {processing ? "Placing Order..." : "Place Order"}
                </button>
            </form>
        </aside>
    );
}
