import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Plus, FolderTree, SlidersHorizontal, Tag, Flame } from "lucide-react";
import CategoriesTab from "./Categories/CategoriesTab";
import SizesTab from "./Sizes/SizesTab";
import TypesTab from "./Types/TypesTab";
import ProductOptionsTab from "./ProductOptions/ProductOptionsTab";
import Button from "@/Components/ui/Button";

export default function CatalogIndex() {
    const [activeTab, setActiveTab] = useState("categories");

    return (
        <AdminLayout>
            <Head title="Catalog Settings" />
            <div
                className="w-full px-4 py-4 bg-background"
                style={{ minHeight: "calc(100vh - 60px)" }}
            >
                <div className="mb-4">
                    <h1 className="mb-2 text-4xl text-primary-text font-semibold">
                        Catalog
                    </h1>
                    <p className="mb-0 text-secondary-dark">
                        Customize categories, sizes, drink types, and product
                        options.
                    </p>
                </div>

                <div
                    className="mb-3 flex items-center gap-2"
                    style={{ borderBottom: "1px solid #d9d1cd" }}
                >
                    <button
                        onClick={() => setActiveTab("categories")}
                        aria-pressed={activeTab === "categories"}
                        className="px-3 py-2 flex items-center"
                        style={
                            activeTab === "categories"
                                ? {
                                      color: "#3E2522",
                                      borderBottom: "3px solid #3E2522",
                                      paddingBottom: 6,
                                      fontWeight: 600,
                                  }
                                : {}
                        }
                    >
                        <FolderTree
                            size={16}
                            className={
                                activeTab === "categories"
                                    ? "mr-2 text-primary-dark"
                                    : "mr-2"
                            }
                        />
                        Categories
                    </button>
                    <button
                        onClick={() => setActiveTab("sizes")}
                        aria-pressed={activeTab === "sizes"}
                        className="px-3 py-2 flex items-center"
                        style={
                            activeTab === "sizes"
                                ? {
                                      color: "#3E2522",
                                      borderBottom: "3px solid #3E2522",
                                      paddingBottom: 6,
                                      fontWeight: 600,
                                  }
                                : {}
                        }
                    >
                        <Tag
                            size={16}
                            className={
                                activeTab === "sizes"
                                    ? "mr-2 text-primary-dark"
                                    : "mr-2"
                            }
                        />
                        Sizes
                    </button>
                    <button
                        onClick={() => setActiveTab("types")}
                        aria-pressed={activeTab === "types"}
                        className="px-3 py-2 flex items-center"
                        style={
                            activeTab === "types"
                                ? {
                                      color: "#3E2522",
                                      borderBottom: "3px solid #3E2522",
                                      paddingBottom: 6,
                                      fontWeight: 600,
                                  }
                                : {}
                        }
                    >
                        <Flame
                            size={16}
                            className={
                                activeTab === "types"
                                    ? "mr-2 text-primary-dark"
                                    : "mr-2"
                            }
                        />
                        Types
                    </button>
                    <button
                        onClick={() => setActiveTab("option-values")}
                        aria-pressed={activeTab === "option-values"}
                        className="px-3 py-2 flex items-center"
                        style={
                            activeTab === "option-values"
                                ? {
                                      color: "#3E2522",
                                      borderBottom: "3px solid #3E2522",
                                      paddingBottom: 6,
                                      fontWeight: 600,
                                  }
                                : {}
                        }
                    >
                        <SlidersHorizontal
                            size={16}
                            className={
                                activeTab === "option-values"
                                    ? "mr-2 text-primary-dark"
                                    : "mr-2"
                            }
                        />
                        Product Options
                    </button>
                </div>

                <div
                    className="border-0 p-0 shadow-none"
                    style={{ background: "transparent" }}
                >
                    <div hidden={activeTab !== "categories"}>
                        <CategoriesTab />
                    </div>

                    <div hidden={activeTab !== "sizes"}>
                        <SizesTab />
                    </div>

                    <div hidden={activeTab !== "types"}>
                        <TypesTab />
                    </div>

                    <div hidden={activeTab !== "option-values"}>
                        <ProductOptionsTab />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
