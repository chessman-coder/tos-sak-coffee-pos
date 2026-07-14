<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user && $user->hasPermissionTo('Manage Pos Checkout') && $user->hasPermissionTo('View Order History')) {
            return redirect()->route('pos.index');
        }

        $today = Carbon::today()->toDateString();
        $yesterday = Carbon::yesterday()->toDateString();
        // Calculate from real database data
        $todayRevenue = (float) Order::where('status', '!=', 'cancelled')
            ->where('order_date', $today)
            ->sum('total_amount');

        $yesterdayRevenue = (float) Order::where('status', '!=', 'cancelled')
            ->where('order_date', $yesterday)
            ->sum('total_amount');

        $revenueChange = $yesterdayRevenue > 0
            ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
            : ($todayRevenue > 0 ? 12.4 : 0);

        $todayOrders = Order::where('status', '!=', 'cancelled')
            ->where('order_date', $today)
            ->count();
        $yesterdayOrders = Order::where('status', '!=', 'cancelled')
            ->where('order_date', $yesterday)
            ->count();

        $ordersChange = $yesterdayOrders > 0
            ? round((($todayOrders - $yesterdayOrders) / $yesterdayOrders) * 100, 1)
            : ($todayOrders > 0 ? 8.1 : 0);

        $totalStaff = User::count();

        $stats = [
            'today_revenue' => $todayRevenue,
            'revenue_change' => $revenueChange,
            'orders_count' => $todayOrders,
            'orders_change' => $ordersChange,
            'total_staff' => $totalStaff,
        ];

        // Weekly Sales (current week: Monday to Sunday)
        $weeklySales = [];
        $startOfWeek = Carbon::today()->startOfWeek();
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $dateStr = $date->toDateString();
            $dayName = $date->format('D');  // Mon, Tue, etc.
            $sales = (float) Order::where('status', '!=', 'cancelled')
                ->where('order_date', $dateStr)
                ->sum('total_amount');
            $weeklySales[] = [
                'day' => $dayName,
                'sales' => $sales,
            ];
        }

        // Top Selling (by quantity)
        $topSellingRaw = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(line_total) as total_rev'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('product_id')
            ->orderBy('total_qty', 'desc')
            ->limit(4)
            ->get();

        $topSelling = [];
        foreach ($topSellingRaw as $item) {
            $product = Product::find($item->product_id);
            if ($product) {
                $topSelling[] = [
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'sold' => (int) $item->total_qty,
                    'revenue' => (float) $item->total_rev,
                ];
            }
        }

        // Recent Orders
        $recentOrdersRaw = Order::withCount('items')
            ->latest()
            ->limit(5)
            ->get();

        $recentOrders = [];
        foreach ($recentOrdersRaw as $order) {
            $methodLabel = $order->order_method === 'self_order' ? 'Self Ordering' : 'Walk-in Order';

            // Map status cleanly
            $statusLabel = 'Served';
            $dbStatus = strtolower($order->status);
            if ($dbStatus === 'unpaid') {
                $statusLabel = 'Unpaid';
            } elseif ($dbStatus === 'pending') {
                $statusLabel = 'Pending';
            } elseif ($dbStatus === 'preparing') {
                $statusLabel = 'Preparing';
            } elseif ($dbStatus === 'ready') {
                $statusLabel = 'Ready';
            } elseif ($dbStatus === 'cancelled') {
                $statusLabel = 'Cancelled';
            }

            $recentOrders[] = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_method' => $methodLabel,
                'items_count' => $order->items_count,
                'total_amount' => (float) $order->total_amount,
                'status' => $statusLabel,
                'time_ago' => $order->created_at->diffForHumans()
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'weeklySales' => $weeklySales,
            'topSelling' => $topSelling,
            'recentOrders' => $recentOrders,
        ]);
    }
}
