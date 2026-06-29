import React from 'react';
import AdminLayout from '../Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { DollarSign, ShoppingBag, Users } from 'lucide-react';
import StatCard from '../Components/ui/StatCard';
import DashboardCharts from '../Components/Dashboard/DashboardCharts';
import RecentOrders from '../Components/Dashboard/RecentOrders';

const Dashboard = ({ stats, weeklySales, topSelling, recentOrders }) => {
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
        <AdminLayout breadcrumb={null}>
            <Head title="Dashboard" />

            <div className="mx-auto space-y-8 pb-12 bg-background px-4 py-6 md:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-text">Dashboard</h1>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        label="Today's Revenue"
                        value={formatCurrency(stats.today_revenue)}
                        icon={<DollarSign className="w-5 h-5 stroke-[2]" />}
                    />

                    <StatCard
                        label="Orders"
                        value={stats.orders_count}
                        icon={<ShoppingBag className="w-5 h-5 stroke-[2]" />}
                    />

                    <StatCard
                        label="Total Staff"
                        value={stats.total_staff}
                        icon={<Users className="w-5 h-5 stroke-[2]" />}
                    />
                </div>


                {/* Charts & Top Sellers Grid */}
                <DashboardCharts weeklySales={weeklySales} topSelling={topSelling} />

                {/* Recent Orders Section */}
                <RecentOrders recentOrders={recentOrders} />
            </div>
        </AdminLayout>
    );
};

export default Dashboard;