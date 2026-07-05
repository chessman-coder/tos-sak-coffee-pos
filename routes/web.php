<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\TypeController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\Size;
use Illuminate\Support\Facades\DB;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/', function (\Illuminate\Http\Request $request) {
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

    // Get top product IDs based on total ordered quantities
    $topProductIds = DB::table('order_items')
        ->select('product_id', DB::raw('SUM(quantity) as total_sales'))
        ->groupBy('product_id')
        ->orderByDesc('total_sales')
        ->limit(5)
        ->pluck('product_id')
        ->toArray();

    if (empty($topProductIds)) {
        // Fallback to top products
        $topSellingProducts = Product::with(['category'])
            ->limit(5)
            ->get();
    } else {
        $topSellingProducts = Product::with(['category'])
            ->whereIn('id', $topProductIds)
            ->get()
            ->sortBy(function ($product) use ($topProductIds) {
                return array_search($product->id, $topProductIds);
            })
            ->values();

        // If we found fewer than 5, fill the rest with other products
        if ($topSellingProducts->count() < 5) {
            $existingIds = $topSellingProducts->pluck('id')->toArray();
            $fillers = Product::with(['category'])
                ->whereNotIn('id', $existingIds)
                ->limit(5 - $topSellingProducts->count())
                ->get();
            $topSellingProducts = $topSellingProducts->concat($fillers);
        }
    }

    // Attach options to each top selling product model manually
    foreach ($topSellingProducts as $product) {
        $product->setRelation('options', $options);
    }
    
    // Get all categories to allow filtering on the frontend
    $categories = Category::all();

    // Get all sizes to check for upcharges on the frontend
    $sizes = Size::all();

    // Generate Order Number
    $max = DB::table('orders')
        ->where('order_number', 'like', 'ORD-%')
        ->selectRaw("MAX(CAST(REPLACE(order_number, 'ORD-', '') AS UNSIGNED)) as max_no")
        ->value('max_no');
    $next = ($max ? (int) $max + 1 : 1);
    $suffix = str_pad($next, 3, '0', STR_PAD_LEFT);
    $orderNumber = 'ORD-' . $suffix;

    return Inertia::render('CustomerOrder/Index', [
        'products' => $products,
        'categories' => $categories,
        'sizes' => $sizes,
        'orderNumber' => $orderNumber,
        'topSellingProducts' => $topSellingProducts,
    ]);
})->name('customer.index');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // POS & Checkout (Protected)
    Route::middleware(['check:Manage Pos Checkout'])->group(function () {
        Route::get('/pos', [POSController::class, 'index'])->name('pos.index');
        Route::post('/checkout/cash/{id}', [PaymentController::class, 'confirmCashPayment'])->name('payment.confirm-cash');
    });
    // Orders module
    Route::middleware(['check:Manage Order'])->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
        Route::patch('/orders/{id}', [OrderController::class, 'update'])->name('orders.update');
        Route::delete('/orders/{id}', [OrderController::class, 'destroy'])->name('orders.destroy');
    });

    // Product & Catalog module
    Route::middleware(['check:Manage Product'])->group(function () {
        Route::get('/catalog', function () {
            return Inertia::render('Catalog/Index');
        })->name('catalog.index');

        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::patch('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
        Route::get('/categories/{id}', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('/types', [TypeController::class, 'index'])->name('types.index');
        Route::get('/types/create', [TypeController::class, 'create'])->name('types.create');
        Route::post('/types', [TypeController::class, 'store'])->name('types.store');
        Route::patch('/types/{id}', [TypeController::class, 'update'])->name('types.update');
        Route::get('/types/{id}', [TypeController::class, 'edit'])->name('types.edit');
        Route::delete('/types/{id}', [TypeController::class, 'destroy'])->name('types.destroy');

        Route::get('/sizes', [SizeController::class, 'index'])->name('sizes.index');
        Route::get('/sizes/create', [SizeController::class, 'create'])->name('sizes.create');
        Route::post('/sizes', [SizeController::class, 'store'])->name('sizes.store');
        Route::patch('/sizes/{id}', [SizeController::class, 'update'])->name('sizes.update');
        Route::get('/sizes/{id}', [SizeController::class, 'edit'])->name('sizes.edit');
        Route::delete('/sizes/{id}', [SizeController::class, 'destroy'])->name('sizes.destroy');

        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::patch('/products/{id}', [ProductController::class, 'update'])->name('products.update');
        Route::get('/products/{id}', [ProductController::class, 'edit'])->name('products.edit');
        Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('products.destroy');
    });

    // Inventory module
    Route::middleware(['check:Manage Inventory'])->group(function () {
        Route::get('/inventories', [InventoryController::class, 'index'])->name('inventories.index');
        Route::post('/inventories', [InventoryController::class, 'store'])->name('inventories.store');
        Route::get('/inventories/{inventory}', [InventoryController::class, 'show'])->name('inventories.show');
        Route::get('/inventories/{inventory}/edit', [InventoryController::class, 'edit'])->name('inventories.edit');
        Route::patch('/inventories/{inventory}', [InventoryController::class, 'update'])->name('inventories.update');
        Route::delete('/inventories/{inventory}', [InventoryController::class, 'destroy'])->name('inventories.destroy');
        Route::post('/inventories/{inventory}/movements', [InventoryController::class, 'storeMovement'])->name('inventories.movements.store');
    });

    // Roles management module
    Route::prefix('roles')->middleware(['check:Manage Role'])->group(function () {
        Route::get('/', [RolesController::class, 'index'])->name('roles.index');
        Route::get('/create', [RolesController::class, 'create'])->name('roles.create');
        Route::get('/{id}', [RolesController::class, 'edit'])->name('roles.edit');
        Route::post('/', [RolesController::class, 'store'])->name('roles.store');
        Route::patch('/{id}', [RolesController::class, 'update'])->name('roles.update');
        Route::delete('/{id}', [RolesController::class, 'destroy'])->name('roles.destroy');
    });

    // Users management module
    Route::prefix('users')->middleware(['check:Manage User'])->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index');
        Route::get('/create', [UserController::class, 'create'])->name('users.create');
        Route::get('/{id}', [UserController::class, 'edit'])->name('users.edit');
        Route::post('/', [UserController::class, 'store'])->name('users.store');
        Route::patch('/{id}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    Route::get('/kitchen', [\App\Http\Controllers\KitchenController::class, 'index'])->name('kitchen.index');
});

// POS & Checkout (Public/Guest)
Route::get('/checkout/{id}', [PaymentController::class, 'checkout'])->name('checkout');
Route::post('/checkout/cancel/{id}', [PaymentController::class, 'cancelOrder'])->name('payment.cancel');
Route::get('/payment/check/{id}', [PaymentController::class, 'checkStatus'])->name('payment.check');
Route::post('/customer-order/store', [OrderController::class, 'store'])->name('customer-order.store');

require __DIR__ . '/auth.php';
