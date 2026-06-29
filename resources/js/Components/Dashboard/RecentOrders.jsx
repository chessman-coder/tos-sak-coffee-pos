import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function RecentOrders({ recentOrders }) {
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: val % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    return (
        <div className="bg-white border border-[#EADBC8] rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(243,237,230,0.5)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-text">Recent Orders</h3>
                <Link
                    href={route('orders.index')}
                    className="text-secondary-text hover:text-primaryColor text-xs font-black flex items-center gap-1 transition-colors"
                >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-[#EADBC8] text-left">
                            <th className="pb-4 text-[10px] tracking-widest text-secondary-text font-black uppercase">Order</th>
                            <th className="pb-4 text-[10px] tracking-widest text-secondary-text font-black uppercase">Order Method</th>
                            <th className="pb-4 text-[10px] tracking-widest text-secondary-text font-black uppercase text-center">Items</th>
                            <th className="pb-4 text-[10px] tracking-widest text-secondary-text font-black uppercase">Total</th>
                            <th className="pb-4 text-[10px] tracking-widest text-secondary-text font-black uppercase">Status</th>
                            <th className="pb-4 text-[10px] tracking-widest text-secondary-text font-black uppercase">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order, idx) => (
                            <tr key={idx} className="border-b border-[#F2ECE4] last:border-b-0 hover:bg-[#FAF6F0] transition-colors">
                                <td className="py-4 text-sm font-black text-primary-text">{order.order_number}</td>
                                <td className="py-4 text-sm text-secondary-text">{order.order_method}</td>
                                <td className="py-4 text-sm text-secondary-text text-center">{order.items_count}</td>
                                <td className="py-4 text-sm font-bold text-primary-text">
                                    {formatCurrency(order.total_amount)}
                                </td>
                                <td className="py-4">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                                            order.status === 'Preparing'
                                                ? 'bg-[#FFF6D2] text-[#EC9303] border-[#FAD896]'
                                                : order.status === 'Pending'
                                                ? 'bg-[#FFE9E3] text-[#FF6F59] border-[#FFD5CC]'
                                                : order.status === 'Ready'
                                                ? 'bg-[#E5F9F3] text-[#00D991] border-[#A7EED3]'
                                                : order.status === 'Cancelled'
                                                ? 'bg-[#FFCED2] text-[#FF002C] border-[#FFB2B8]'
                                                : 'bg-[#F0EBE5] text-[#6B6B6B] border-[#E0D8CF]'
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 text-sm text-secondary-text">{order.time_ago}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
