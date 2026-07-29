import { Link, usePage } from "@inertiajs/react";
import $ from "jquery";
import "admin-lte/dist/css/adminlte.min.css"; // Ensure styles are loaded
import "admin-lte/dist/js/adminlte.min.js";
import { useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    ClipboardClock,
    Store,
    LogOut,
    Boxes,
    Coffee,
    ShieldCheck,
    Settings,
    TrendingUp,
    ChefHat,
} from "lucide-react";

export default function MenuSideBar({}) {
    const { auth, settings } = usePage().props;
    const can = auth?.can ?? {};
    useEffect(() => {
        // Ensure dropdowns, tooltips, and modals work
        $('[data-toggle="dropdown"]').dropdown();
    }, []);

    useEffect(() => {
        // Initialize AdminLTE sidebar treeview
        $('[data-widget="treeview"]').each(function () {
            $(this).Treeview("init");
        });
    }, []);

    return (
        <>
            {/* Sidebar */}
            <aside className="main-sidebar fixed left-0 top-0 z-[1040] bg-primaryColor elevation-4 flex flex-col max-h-screen overflow-hidden">
                <Link href="/" className="brand-link">
                    <div className="flex justify-center items-center gap-4">
                            <div className="p-2 bg-card rounded-2xl">
                            <img
                                    src={settings?.logo_url || "/images/logo.svg"}
                                className="h-14 w-14"
                                alt="brand logo"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="font-black text-2xl text-white">
                                    {settings?.store_name || "TOS SAK"}
                            </p>
                            <p className="block text-xs font-semibold tracking-widest text-secondary-dark">
                                COFFEE POS
                            </p>
                        </div>
                    </div>
                </Link>
                <div className="sidebar flex flex-1 flex-col">
                    <nav className="mt-2 flex-1 overflow-y-auto">
                        <ul
                            className="nav nav-pills nav-sidebar flex-column"
                            data-widget="treeview"
                            role="menu"
                            data-accordion="false"
                        >
                            {can["Manage Pos Checkout"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("pos.index")}
                                        className={`nav-link navbar-item ${route().current("pos.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <Store className="nav-icon" />
                                        <span>POS</span>
                                    </Link>
                                </li>
                            )}
                            {can["View Dashboard"] && (
                                <>
                                    <li className="nav-item">
                                        <Link
                                            href={route("dashboard")}
                                            className={`nav-link navbar-item ${route().current("dashboard") && "active"}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <LayoutDashboard className="nav-icon" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            href={route("sale-analytics.index")}
                                            className={`nav-link navbar-item ${route().current("sale-analytics.index") && "active"}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <TrendingUp className="nav-icon" />
                                            <span>Sales Analytics</span>
                                        </Link>
                                    </li>
                                </>
                            )}
                            {can["View Kitchen Dashboard"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("kitchen.index")}
                                        className={`nav-link navbar-item ${route().current("kitchen.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <ChefHat className="nav-icon" />
                                        <span>Kitchen</span>
                                    </Link>
                                </li>
                            )}

                            {can["Manage Product"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("catalog.index")}
                                        className={`nav-link navbar-item ${route().current("catalog.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <ClipboardList className="nav-icon" />
                                        <span>Catalog</span>
                                    </Link>
                                </li>
                            )}
                            {can["Manage Product"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("products.index")}
                                        className={`nav-link navbar-item ${route().current("products.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <Coffee className="nav-icon" />
                                        <span>Product</span>
                                    </Link>
                                </li>
                            )}
                            {can["Manage Inventory"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("inventories.index")}
                                        className={`nav-link navbar-item ${route().current("inventories.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <Boxes className="nav-icon" />
                                        <span>Inventory</span>
                                    </Link>
                                </li>
                            )}
                            {can["Manage User"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("users.index")}
                                        className={`nav-link navbar-item ${route().current("users.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <Users className="nav-icon" />
                                        <span>Users</span>
                                    </Link>
                                </li>
                            )}
                            {can["Manage Role"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("roles.index")}
                                        className={`nav-link navbar-item ${route().current("roles.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <ShieldCheck className="nav-icon" />
                                        <span>Role</span>
                                    </Link>
                                </li>
                            )}
                            {can["Manage Settings"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("settings.index")}
                                        className={`nav-link navbar-item ${route().current("settings.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <Settings className="nav-icon" />
                                        <span>Settings</span>
                                    </Link>
                                </li>
                            )}
                            {can["View Order History"] && (
                                <li className="nav-item">
                                    <Link
                                        href={route("orders.index")}
                                        className={`nav-link navbar-item ${route().current("orders.index") && "active"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <ClipboardClock className="nav-icon" />
                                        <span>Order History</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                </div>
                <div className="mt-auto flex justify-center pb-4">
                    <Link
                        href={route("logout")}
                        className="border-2 border-solid border-main text-main rounded-xl hover:text-main/70 hover:border-main/70"
                        method="post"
                        as="button"
                        style={{
                            display: "flex",
                            padding: "8px 48px",
                            gap: "12px",
                        }}
                    >
                        <LogOut className="mr-[3px]" />
                        <span>Log Out</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
