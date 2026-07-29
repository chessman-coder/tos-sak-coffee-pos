import React, { useMemo } from "react";
import { Search, Flame, Plus, ImageIcon } from "lucide-react";
import ProductGrid from "@/Components/CustomerOrder/ProductGrid";

// Format Price Utility
const formatPrice = (price) => {
    const amount = Number(price ?? 0);
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function ProductMenu({
    search,
    setSearch,
    selectedCategoryId,
    setSelectedCategoryId,
    categories = [],
    parentCategories = [],
    subCategoriesMap = {},
    filteredProducts = [],
    handleAddToCartClick,
    topSellingProducts = [],
}) {
    const selectedCategoryObj = useMemo(() => {
        if (selectedCategoryId === null || selectedCategoryId === undefined || selectedCategoryId === "") return null;
        return categories.find((c) => String(c.id) === String(selectedCategoryId));
    }, [categories, selectedCategoryId]);

    const activeParentCategoryId = selectedCategoryObj
        ? (selectedCategoryObj.parent_id ?? selectedCategoryObj.id)
        : null;

    const activeSubCategoryId = selectedCategoryObj?.parent_id ? selectedCategoryObj.id : null;

    const activeSubCategories = useMemo(() => {
        if (!activeParentCategoryId) return [];
        return (
            subCategoriesMap[activeParentCategoryId] ||
            subCategoriesMap[String(activeParentCategoryId)] ||
            []
        );
    }, [activeParentCategoryId, subCategoriesMap]);

    const sectionTitle = useMemo(() => {
        if (search.trim()) {
            return `Results for "${search.trim()}"`;
        }
        if (selectedCategoryObj) {
            return selectedCategoryObj.name;
        }
        return "All Products";
    }, [search, selectedCategoryObj]);

    return (
        <div className="flex-1 space-y-6 w-full">
            {/* Welcome Vibe & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f1a16] tracking-tight">
                        Explore Menu
                    </h2>
                    <p className="text-sm text-[#8b6b61]">
                        Freshly brewed drinks & pastries prepared for you.
                    </p>
                </div>
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6b61]"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search drinks, bakery, category..."
                        className="h-11 w-full rounded-full border border-[#eadfda] bg-white pl-11 pr-4 text-sm text-[#2f1a16] shadow-sm outline-none transition focus:border-[#c07a49] focus:ring-2 focus:ring-[#f3ede9]"
                    />
                </div>
            </div>

            {/* Category Navigation Pills */}
            <nav className="flex flex-col gap-3">
                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <button
                        type="button"
                        onClick={() => setSelectedCategoryId(null)}
                        className={`rounded-full px-5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer shrink-0 ${activeParentCategoryId === null
                            ? "bg-[#5a3630] text-white"
                            : "bg-white border border-[#eadfda] text-[#5a3630] hover:bg-[#fbf8f5]"
                            }`}
                    >
                        All Products
                    </button>
                    {parentCategories.map((cat) => {
                        const isParentActive = activeParentCategoryId !== null && String(activeParentCategoryId) === String(cat.id);
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategoryId(cat.id)}
                                className={`rounded-full px-5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer shrink-0 ${isParentActive
                                    ? "bg-[#5a3630] text-white"
                                    : "bg-white border border-[#eadfda] text-[#5a3630] hover:bg-[#fbf8f5]"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* Subcategory Pills */}
                {activeParentCategoryId && activeSubCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 border-t border-[#eadfda] pt-3 animate-fadeIn">
                        <span className="text-xs text-[#8b6b61] font-semibold flex items-center mr-1">
                            Subcategories:
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedCategoryId(activeParentCategoryId)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${!activeSubCategoryId
                                ? "bg-[#5a3630] text-white"
                                : "bg-[#f3ede9] text-[#5a3630] hover:bg-[#eee4de]"
                                }`}
                        >
                            All {categories.find((c) => String(c.id) === String(activeParentCategoryId))?.name}
                        </button>
                        {activeSubCategories.map((sub) => {
                            const isSubActive = activeSubCategoryId !== null && String(activeSubCategoryId) === String(sub.id);
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => setSelectedCategoryId(isSubActive ? activeParentCategoryId : sub.id)}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${isSubActive
                                        ? "bg-[#5a3630] text-white"
                                        : "bg-[#f3ede9] text-[#5a3630] hover:bg-[#eee4de]"
                                        }`}
                                >
                                    {sub.name}
                                </button>
                            );
                        })}
                    </div>
                )}
            </nav>

            {/* Top Selling / Best Sellers Section */}
            {!selectedCategoryId && !search && topSellingProducts.length > 0 && (
                <section className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-extrabold text-[#2f1a16] tracking-tight flex items-center gap-1.5">
                                <Flame className="text-[#e05a47] fill-[#e05a47] animate-pulse" size={20} />
                                Customer Favorites
                            </span>
                            <span className="bg-[#f3ede9] text-[#5a3630] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Top Sellers
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                        {topSellingProducts.map((prod) => {
                            const imageUrl = prod.image_url ?? (prod.image_path ? `/storage/${prod.image_path}` : "");
                            const categoryName = prod.category?.name ?? "Special";
                            const hasStock = prod.stock !== null && prod.stock !== undefined && prod.stock !== "";
                            const isOutOfStock = hasStock && Number(prod.stock) <= 0;

                            return (
                                <article
                                    key={`top-${prod.id}`}
                                    onClick={() => !isOutOfStock && handleAddToCartClick(prod)}
                                    className={`group relative flex flex-col w-[170px] sm:w-[200px] shrink-0 overflow-hidden rounded-[24px] border border-[#ebdcd4] bg-white shadow-sm hover:shadow-lg hover:border-[#d9c4b7] transition duration-300 cursor-pointer ${isOutOfStock ? "opacity-60 cursor-not-allowed" : "active:scale-98"
                                        }`}
                                >
                                    {/* Best Seller badge */}
                                    <div className="absolute top-2.5 left-2.5 z-10 bg-[#e05a47] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                        <Flame size={10} className="fill-current text-white" />
                                        Popular
                                    </div>

                                    {/* Visual representation: Top half with warm background */}
                                    <div className="h-32 sm:h-40 flex items-center justify-center bg-[#f7f2ef] relative overflow-hidden">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={prod.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-3 text-center w-full h-full text-[#8b6b61]">
                                                <ImageIcon size={18} />
                                            </div>
                                        )}

                                        {/* Out of Stock Ribbon */}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="bg-[#5a3630] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                                    Sold Out
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info: Bottom half with white background */}
                                    <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#c07a49] mb-1">
                                                {categoryName}
                                            </p>
                                            <h3 className="text-xs sm:text-sm font-bold text-[#2f1a16] line-clamp-2 leading-snug group-hover:text-[#5a3630]">
                                                {prod.name}
                                            </h3>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between gap-1.5">
                                            <span className="text-sm sm:text-base font-black text-[#5a3630]">
                                                ${formatPrice(prod.price)}
                                            </span>
                                            {!isOutOfStock && (
                                                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-[#f3ede9] text-[#5a3630] flex items-center justify-center group-hover:bg-[#5a3630] group-hover:text-white transition duration-200">
                                                    <Plus size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Product Card Grid Header & Grid */}
            <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-[#2f1a16] tracking-tight">
                    {sectionTitle}
                </span>
                <span className="text-xs text-[#8b6b61] font-semibold">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                </span>
            </div>
            <ProductGrid
                filteredProducts={filteredProducts}
                handleAddToCartClick={handleAddToCartClick}
            />
        </div>
    );
}
