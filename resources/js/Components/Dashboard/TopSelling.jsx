import React from 'react';

export default function TopSelling({ topSelling }) {
    // Formatter helpers
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: val % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2
        }).format(val);
    };

    return (
        <div className="bg-white border border-[#EADBC8] rounded-[2rem] p-6 lg:p-8 flex flex-col shadow-[0_8px_30px_rgb(243,237,230,0.5)]">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-primary-text">Top Selling</h3>
            </div>

            <div className="flex flex-col justify-center space-y-6">
                {topSelling && topSelling.length > 0 ? (
                    topSelling.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                {/* Rank circle */}
                                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#FAF6F0] border border-[#EADBC8] text-primary-text text-[13px] font-black">
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="font-bold text-primary-text text-sm">{item.name}</div>
                                    <div className="text-secondary-text text-xs">{item.sold} sold</div>
                                </div>
                            </div>
                            <div className="font-black text-primary-text text-sm">
                                {formatCurrency(item.price)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-secondary-text text-sm font-semibold">No sales recorded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
