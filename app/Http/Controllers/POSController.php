<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class POSController extends Controller
{
    /**
     * Display the POS checkout screen.
     */
    public function index(Request $request): Response
    {
        // Get all products including category
        $products = Product::with(['category'])->orderBy('name')->get();

        // Get all global product options with their values
        $options = ProductOption::with(['values' => function ($valueQuery) {
            $valueQuery->orderBy('sort_order')->orderBy('id');
        }])->orderBy('sort_order')->orderBy('id')->get();

        // Attach options to each product model manually
        foreach ($products as $product) {
            $product->setRelation('options', $options);
        }
        
        // Get all categories to allow filtering on the frontend
        $categories = Category::all();

        // Get all sizes to check for upcharges on the frontend
        $sizes = Size::all();

        return Inertia::render('POS/Pos', [
            'products' => $products,
            'categories' => $categories,
            'sizes' => $sizes,
            'orderNumber' => $this->generateOrderNumber(),
        ]);
    }

    /**
     * Generate a unique order number in format ORD-XXX
     */
    private function generateOrderNumber(): string
    {
        $max = DB::table('orders')
            ->where('order_number', 'like', 'ORD-%')
            ->selectRaw("MAX(CAST(REPLACE(order_number, 'ORD-', '') AS UNSIGNED)) as max_no")
            ->value('max_no');

        $next = ($max ? (int) $max + 1 : 1);
        $suffix = str_pad($next, 3, '0', STR_PAD_LEFT);
        $num = 'ORD-' . $suffix;

        while (Order::where('order_number', $num)->exists()) {
            $next++;
            $suffix = str_pad($next, 3, '0', STR_PAD_LEFT);
            $num = 'ORD-' . $suffix;
        }

        return $num;
    }
}
