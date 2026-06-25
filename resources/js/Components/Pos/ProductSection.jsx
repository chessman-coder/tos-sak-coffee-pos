import React from "react";
import { Search, ClipboardList } from "lucide-react";
import ProductCard from "@/Components/Pos/ProductCard";

export default function ProductSection({
    activeTab,
    orderNumber,
    search,
    setSearch,
    selectedCategoryId,
    setSelectedCategoryId,
    parentCategories = [],
    subCategoriesMap = {},
    filteredProducts = [],
    onAddToCart,
}) {
    return (
        <section className={`flex-1 flex-col overflow-y-auto px-4 py-4 md:px-6 md:py-6 lg:px-8 ${activeTab === 'products' ? 'flex' : 'hidden lg:flex'}`}>
            {/* Header */}
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-extrabold text-[#2f1a16] tracking-tight">
                        POS Checkout
                    </h1>
                    <p className="text-sm text-secondary-dark mt-1">
                        Walk-in Sales Portal
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary-dark"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="h-11 w-full rounded-full border border-[#eadfda] bg-white pl-11 pr-4 text-sm text-[#2f1a16] shadow-sm outline-none transition focus:border-[#c07a49] focus:ring-2 focus:ring-[#f3ede9]"
                    />
                </div>
            </header>

            {/* Category tabs */}
            <nav className="mb-6 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedCategoryId(null)}
                        className={`rounded-full px-5 py-2 text-xs font-bold transition shadow-sm ${selectedCategoryId === null
                            ? "bg-[#5a3630] text-white"
                            : "bg-white border border-[#eadfda] text-secondary-dark hover:bg-[#fbf8f5]"
                            }`}
                    >
                        All Products
                    </button>
                    {parentCategories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`rounded-full px-5 py-2 text-xs font-bold transition shadow-sm ${selectedCategoryId === cat.id
                                ? "bg-[#5a3630] text-white"
                                : "bg-white border border-[#eadfda] text-secondary-dark hover:bg-[#fbf8f5]"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Subcategory pills if a parent is selected */}
                {selectedCategoryId && subCategoriesMap[selectedCategoryId] && (
                    <div className="flex flex-wrap gap-1.5 border-t border-[#eadfda] pt-3">
                        <span className="text-xs text-secondary-dark flex items-center mr-1">
                            Subcategories:
                        </span>
                        {subCategoriesMap[selectedCategoryId].map((sub) => (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => setSelectedCategoryId(sub.id)}
                                className="rounded-full bg-[#f3ede9] px-3.5 py-1.5 text-xs font-semibold text-[#5a3630] transition hover:bg-[#eee4de]"
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Product Grid */}
            <div className="flex-1">
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((prod) => (
                            <ProductCard
                                key={prod.id}
                                product={prod}
                                canView={false}
                                canEdit={false}
                                canDelete={false}
                                onAddToCart={onAddToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-[#eadfda] shadow-sm">
                        <ClipboardList size={48} className="text-[#c07a49] mb-3" />
                        <h3 className="text-lg font-semibold text-[#2f1a16]">
                            No products found
                        </h3>
                        <p className="text-sm text-secondary-dark mt-1">
                            Try searching for a different keyword or category.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
