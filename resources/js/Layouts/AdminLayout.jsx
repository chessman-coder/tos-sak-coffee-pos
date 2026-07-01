import React, { useEffect, useState } from 'react';
import 'admin-lte/dist/css/adminlte.min.css'; // Ensure styles are loaded
import 'admin-lte/dist/js/adminlte.min.js';
import MenuSideBar from './MenuSideBar';
import $ from 'jquery';
import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminLayout = ({ breadcrumb, children, className = "" }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Ensure dropdowns, tooltips, and modals work
        $('[data-toggle="dropdown"]').dropdown();

        const checkCollapsedState = () => {
            if (window.innerWidth < 992) {
                return !$('body').hasClass('sidebar-open');
            } else {
                return $('body').hasClass('sidebar-collapse');
            }
        };

        setIsCollapsed(checkCollapsedState());

        const handleCollapsed = () => setIsCollapsed(true);
        const handleShown = () => setIsCollapsed(false);
        const handleResize = () => setIsCollapsed(checkCollapsedState());

        $(document).on('collapsed.lte.pushmenu', handleCollapsed);
        $(document).on('shown.lte.pushmenu', handleShown);
        window.addEventListener('resize', handleResize);

        return () => {
            $(document).off('collapsed.lte.pushmenu', handleCollapsed);
            $(document).off('shown.lte.pushmenu', handleShown);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const { auth } = usePage().props;
    const can = auth?.can ?? {};

    // Check if the user has cashier permissions but is not an admin
    // const isCashier = (can["Manage Pos Checkout"] && (can["View Order History"] || can["Manage Order"])) && !can["View Dashboard"];
    const isCashier = (can["Manage Pos Checkout"] && can["Manage Order"]);
    const hasSidebar = !isCashier;

    const getInitials = (name = "") =>
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "U";

    return (
        <div className="wrapper flex flex-col h-screen overflow-hidden">
            {/* Navbar */}
            <nav
                className="main-header navbar navbar-expand bg-background navbar-light"
                style={{ marginLeft: hasSidebar ? '' : '0' }}
            >
                <ul className="navbar-nav">
                    {hasSidebar && (
                        <li className="nav-item">
                            <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                                {isCollapsed ? (
                                    <ChevronRight className='size-6' />
                                ) : (
                                    <ChevronLeft className='size-6' />
                                )}
                            </a>
                        </li>
                    )}
                </ul>
                {/* <!-- Right navbar links --> */}
                <ul className="navbar-nav ml-auto">
                    {/* Dropdown */}
                    <li className="nav-item dropdown">
                        <a className="nav-link flex items-center px-2 gap-2 text-sm font-bold border border-primaryColor rounded-xl" data-toggle="dropdown" href="#">
                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary-dark text-sm font-bold text-white">
                                {getInitials(
                                    auth?.user?.name,
                                )}
                            </div>
                            <div>
                                {auth?.user?.name}
                            </div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <Link href={route('profile.edit')} className="dropdown-item">Profile</Link>
                            <div className="dropdown-divider"></div>
                            <Link
                                className="dropdown-item"
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Logout
                            </Link>
                        </div>
                    </li>
                </ul>
            </nav>

            {hasSidebar && <MenuSideBar />}

            {/* Content Wrapper */}
            <div
                className={`content-wrapper h-screen overflow-auto ${className}`}
                style={{ marginLeft: hasSidebar ? '' : '0' }}
            >
                {breadcrumb && breadcrumb}
                <section>{children}</section>
            </div>

            {/* Footer */}
            {/* <footer className="main-footer">
                <strong>Copyright &copy; 2025</strong> All rights reserved.
            </footer> */}
        </div>
    );
};

export default AdminLayout;
