<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\QrOrderApiController;
use App\Http\Controllers\Api\KitchenApiController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\SizeApiController;
use App\Http\Controllers\Api\TypeApiController;
use App\Http\Controllers\Api\ProductOptionValueApiController;
use App\Http\Controllers\Api\ProductOptionApiController;
use App\Models\Product;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group([ 'middleware' => 'api', 'prefix' => 'auth' ], function ($router) {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');
    });
});

// Catalog JSON endpoints (basic CRUD for the catalog settings UI)
Route::get('/catalog/categories', [CategoryApiController::class, 'index']);
Route::post('/catalog/categories', [CategoryApiController::class, 'store']);
Route::patch('/catalog/categories/{id}', [CategoryApiController::class, 'update']);
Route::delete('/catalog/categories/{id}', [CategoryApiController::class, 'destroy']);

Route::get('/catalog/sizes', [SizeApiController::class, 'index']);
Route::post('/catalog/sizes', [SizeApiController::class, 'store']);
Route::patch('/catalog/sizes/{id}', [SizeApiController::class, 'update']);
Route::delete('/catalog/sizes/{id}', [SizeApiController::class, 'destroy']);

Route::get('/catalog/types', [TypeApiController::class, 'index']);
Route::post('/catalog/types', [TypeApiController::class, 'store']);
Route::patch('/catalog/types/{id}', [TypeApiController::class, 'update']);
Route::delete('/catalog/types/{id}', [TypeApiController::class, 'destroy']);

Route::get('/catalog/product-option-values', [ProductOptionValueApiController::class, 'index']);
Route::post('/catalog/product-option-values', [ProductOptionValueApiController::class, 'store']);
Route::patch('/catalog/product-option-values/{id}', [ProductOptionValueApiController::class, 'update']);
Route::delete('/catalog/product-option-values/{id}', [ProductOptionValueApiController::class, 'destroy']);

Route::get('/catalog/product-options', [ProductOptionApiController::class, 'index']);
Route::post('/catalog/product-options', [ProductOptionApiController::class, 'store']);
Route::patch('/catalog/product-options/{id}', [ProductOptionApiController::class, 'update']);
Route::delete('/catalog/product-options/{id}', [ProductOptionApiController::class, 'destroy']);

Route::get('/catalog/products', function () {
    return response()->json(Product::orderBy('name')->get(['id', 'name', 'price']));
});

// QR Self-Ordering API routes
Route::get('/qr-order/products', [QrOrderApiController::class, 'products']);
Route::post('/qr-order', [QrOrderApiController::class, 'store']);
Route::get('/qr-order/tracking/{order_number}', [QrOrderApiController::class, 'track']);

// Kitchen API routes
Route::get('/kitchen/orders', [KitchenApiController::class, 'index']);
Route::post('/kitchen/orders/{id}/status', [KitchenApiController::class, 'updateStatus']);

// Telegram Bot Webhook
Route::post('/telegram/webhook', [\App\Http\Controllers\TelegramWebhookController::class, 'handle']);