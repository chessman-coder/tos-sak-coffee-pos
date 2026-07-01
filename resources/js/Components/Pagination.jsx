import React from 'react';
import { Link } from '@inertiajs/react';
export default function Pagination({ links }) {
    return (
        links?.length > 3 ? (
            <div className="flex items-center gap-1.5">
                {links?.map((link, key) => {
                    const label = link?.label
                        .replace('&laquo;', '<')
                        .replace('&raquo;', '>')
                        .replace('Previous', '<')
                        .replace('Next', '>');

                    const isActive = link?.active;
                    const isDisabled = link?.url === null;

                    if (isDisabled) {
                        return (
                            <span
                                key={key}
                                className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-[#eededa] bg-[#f9f5f2] px-3 text-xs font-bold text-gray-300 cursor-not-allowed select-none"
                            >
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={key}
                            href={link?.url}
                            className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border px-3 text-xs font-bold transition duration-150 ${isActive
                                    ? "bg-[#5a3630] text-white border-transparent"
                                    : "bg-white text-[#4a2b25] border-[#eadfda] hover:bg-[#fcf8f6]"
                                }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
        ) : null
    );
}