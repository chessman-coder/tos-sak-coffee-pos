<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\TelegramService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleAnalyticsController extends Controller
{
    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $period = $request->input('period', 'day'); // day, month, year

        try {
            $carbonDate = Carbon::parse($date);
        } catch (\Exception $e) {
            $carbonDate = Carbon::today();
            $date = $carbonDate->toDateString();
        }

        // Apply filters to orders query
        $ordersQuery = Order::where('status', '!=', 'cancelled');

        if ($period === 'day') {
            $ordersQuery->whereDate('order_date', $date);
        } elseif ($period === 'month') {
            $ordersQuery->whereYear('order_date', $carbonDate->year)
                ->whereMonth('order_date', $carbonDate->month);
        } elseif ($period === 'year') {
            $ordersQuery->whereYear('order_date', $carbonDate->year);
        }

        $orders = $ordersQuery->get();

        $totalRevenue = (float) $orders->sum('total_amount');
        $totalOrders = $orders->count();

        // Calculate daily average revenue
        if ($period === 'day') {
            $dailyAvgRevenue = $totalRevenue;
        } elseif ($period === 'month') {
            $isCurrentMonth = ($carbonDate->format('Y-m') === Carbon::today()->format('Y-m'));
            $daysInPeriod = $isCurrentMonth ? Carbon::today()->day : $carbonDate->daysInMonth;
            $dailyAvgRevenue = $totalRevenue / ($daysInPeriod ?: 1);
        } else { // year
            $isCurrentYear = ($carbonDate->format('Y') === Carbon::today()->format('Y'));
            $daysInPeriod = $isCurrentYear ? Carbon::today()->dayOfYear : ($carbonDate->isLeapYear() ? 366 : 365);
            $dailyAvgRevenue = $totalRevenue / ($daysInPeriod ?: 1);
        }

        // Top Selling (by Qty)
        $topSellingByQtyRaw = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(line_total) as total_rev'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled');

        if ($period === 'day') {
            $topSellingByQtyRaw->whereDate('orders.order_date', $date);
        } elseif ($period === 'month') {
            $topSellingByQtyRaw->whereYear('orders.order_date', $carbonDate->year)
                ->whereMonth('orders.order_date', $carbonDate->month);
        } elseif ($period === 'year') {
            $topSellingByQtyRaw->whereYear('orders.order_date', $carbonDate->year);
        }

        $topSellingByQty = $topSellingByQtyRaw->groupBy('product_id')
            ->orderBy('total_qty', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $product = Product::find($item->product_id);
                return [
                    'name' => $product ? $product->name : 'Unknown Product',
                    'sold' => (int) $item->total_qty,
                    'revenue' => (float) $item->total_rev,
                ];
            });

        // Top Selling (by Revenue)
        $topSellingByRevRaw = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(line_total) as total_rev'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled');

        if ($period === 'day') {
            $topSellingByRevRaw->whereDate('orders.order_date', $date);
        } elseif ($period === 'month') {
            $topSellingByRevRaw->whereYear('orders.order_date', $carbonDate->year)
                ->whereMonth('orders.order_date', $carbonDate->month);
        } elseif ($period === 'year') {
            $topSellingByRevRaw->whereYear('orders.order_date', $carbonDate->year);
        }

        $topSellingByRev = $topSellingByRevRaw->groupBy('product_id')
            ->orderBy('total_rev', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $product = Product::find($item->product_id);
                return [
                    'name' => $product ? $product->name : 'Unknown Product',
                    'sold' => (int) $item->total_qty,
                    'revenue' => (float) $item->total_rev,
                ];
            });

        // Chart Data comparing the selected period
        $chartData = [];
        if ($period === 'day') {
            // Show Mon-Sun of the week containing the selected date
            $startOfWeek = $carbonDate->copy()->startOfWeek();
            for ($i = 0; $i < 7; $i++) {
                $curr = $startOfWeek->copy()->addDays($i);
                $currStr = $curr->toDateString();
                $sales = (float) Order::where('status', '!=', 'cancelled')
                    ->where('order_date', $currStr)
                    ->sum('total_amount');
                $chartData[] = [
                    'label' => $curr->format('D (d)'),
                    'sales' => $sales,
                    'isCurrent' => $currStr === $date
                ];
            }
        } elseif ($period === 'month') {
            // Show each day of the selected month
            $daysInMonth = $carbonDate->daysInMonth;
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $currStr = sprintf('%04d-%02d-%02d', $carbonDate->year, $carbonDate->month, $i);
                $sales = (float) Order::where('status', '!=', 'cancelled')
                    ->where('order_date', $currStr)
                    ->sum('total_amount');
                $chartData[] = [
                    'label' => (string) $i,
                    'sales' => $sales,
                    'isCurrent' => $currStr === $date
                ];
            }
        } elseif ($period === 'year') {
            // Show each of the 12 months of the selected year
            for ($i = 1; $i <= 12; $i++) {
                $monthStart = sprintf('%04d-%02d-01', $carbonDate->year, $i);
                $carbonMonth = Carbon::parse($monthStart);
                $sales = (float) Order::where('status', '!=', 'cancelled')
                    ->whereYear('order_date', $carbonDate->year)
                    ->whereMonth('order_date', $i)
                    ->sum('total_amount');
                $chartData[] = [
                    'label' => $carbonMonth->format('M'),
                    'sales' => $sales,
                    'isCurrent' => $i === now()->month && $carbonDate->year === now()->year
                ];
            }
        }

        return Inertia::render('SaleAnalytics/Index', [
            'filters' => [
                'date' => $date,
                'period' => $period,
            ],
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'daily_avg_revenue' => $dailyAvgRevenue,
            ],
            'topSellingByQty' => $topSellingByQty,
            'topSellingByRev' => $topSellingByRev,
            'chartData' => $chartData,
        ]);
    }

    public function sendTelegramReport(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $period = $request->input('period', 'day');

        try {
            $carbonDate = Carbon::parse($date);
        } catch (\Exception $e) {
            $carbonDate = Carbon::today();
            $date = $carbonDate->toDateString();
        }

        // Apply filters to orders query
        $ordersQuery = Order::where('status', '!=', 'cancelled');

        if ($period === 'day') {
            $ordersQuery->whereDate('order_date', $date);
            $formattedPeriod = "Day: " . $date;
        } elseif ($period === 'month') {
            $ordersQuery->whereYear('order_date', $carbonDate->year)
                ->whereMonth('order_date', $carbonDate->month);
            $formattedPeriod = "Month: " . $carbonDate->format('F Y');
        } else {
            $ordersQuery->whereYear('order_date', $carbonDate->year);
            $formattedPeriod = "Year: " . $carbonDate->year;
        }

        $orders = $ordersQuery->get();

        $totalRevenue = (float) $orders->sum('total_amount');
        $totalOrders = $orders->count();

        // Calculate daily average revenue
        if ($period === 'day') {
            $dailyAvgRevenue = $totalRevenue;
        } elseif ($period === 'month') {
            $isCurrentMonth = ($carbonDate->format('Y-m') === Carbon::today()->format('Y-m'));
            $daysInPeriod = $isCurrentMonth ? Carbon::today()->day : $carbonDate->daysInMonth;
            $dailyAvgRevenue = $totalRevenue / ($daysInPeriod ?: 1);
        } else { // year
            $isCurrentYear = ($carbonDate->format('Y') === Carbon::today()->format('Y'));
            $daysInPeriod = $isCurrentYear ? Carbon::today()->dayOfYear : ($carbonDate->isLeapYear() ? 366 : 365);
            $dailyAvgRevenue = $totalRevenue / ($daysInPeriod ?: 1);
        }

        // Top Selling (by Qty)
        $topSellingByQtyRaw = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(line_total) as total_rev'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled');

        if ($period === 'day') {
            $topSellingByQtyRaw->whereDate('orders.order_date', $date);
        } elseif ($period === 'month') {
            $topSellingByQtyRaw->whereYear('orders.order_date', $carbonDate->year)
                ->whereMonth('orders.order_date', $carbonDate->month);
        } elseif ($period === 'year') {
            $topSellingByQtyRaw->whereYear('orders.order_date', $carbonDate->year);
        }

        $topSellingByQty = $topSellingByQtyRaw->groupBy('product_id')
            ->orderBy('total_qty', 'desc')
            ->limit(5)
            ->get();

        // Build HTML Message
        $htmlMessage = "📊 <b>Sales Analytics Report</b>\n";
        $htmlMessage .= "=========================\n";
        $htmlMessage .= "📅 <b>Period:</b> " . e($formattedPeriod) . "\n\n";
        $htmlMessage .= "💵 <b>Total Revenue:</b> $" . number_format($totalRevenue, 2) . "\n";
        $htmlMessage .= "📦 <b>Total Orders:</b> " . $totalOrders . "\n";
        $htmlMessage .= "📈 <b>Daily Avg Revenue:</b> $" . number_format($dailyAvgRevenue, 2) . "\n\n";

        if ($topSellingByQty->isNotEmpty()) {
            $htmlMessage .= "🔝 <b>Top Selling Items:</b>\n";
            foreach ($topSellingByQty as $item) {
                $product = Product::find($item->product_id);
                $name = $product ? $product->name : 'Unknown Product';
                $htmlMessage .= "  • " . e($name) . ": <b>" . $item->total_qty . "</b> sold ($" . number_format($item->total_rev, 2) . ")\n";
            }
        } else {
            $htmlMessage .= "No sales recorded for this period.\n";
        }

        $success = $this->telegramService->sendPeriodSalesReport($htmlMessage);

        if ($success) {
            return response()->json(['message' => 'Report sent successfully to Telegram!']);
        }

        return response()->json(['error' => 'Failed to send report. Please check your Telegram configurations.'], 500);
    }
}
