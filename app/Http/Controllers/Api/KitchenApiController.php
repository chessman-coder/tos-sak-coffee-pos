<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KitchenApiController extends Controller
{
    /**
     * Get active kitchen orders (pending, preparing, ready)
     */
    public function index(): JsonResponse
    {
        $orders = Order::with(['items.product', 'items.options'])
            ->whereIn('status', ['pending', 'preparing', 'ready'])
            ->orderBy('created_at', 'asc')
            ->get();

        $data = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'waiting_number' => $order->waiting_number,
                'customer_name' => $order->customer_name,
                'phone_number' => $order->phone_number,
                'order_type' => $order->order_type,
                'status' => $order->status,
                'notes' => $order->notes,
                'created_at' => $order->created_at->toIso8601String(),
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'product_name' => $item->product ? $item->product->name : ($item->type ? $item->type : 'Unknown Item'),
                        'options' => $item->options->map(function ($option) {
                            return [
                                'option_label' => $option->option_label,
                                'value_label' => $option->value_label,
                            ];
                        })->toArray(),
                    ];
                })->toArray(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,preparing,ready,completed,cancelled'],
        ]);

        $order = Order::with(['items.product', 'items.options'])->findOrFail($id);
        $order->status = $validated['status'];
        $order->save();

        $orderData = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'waiting_number' => $order->waiting_number,
            'customer_name' => $order->customer_name,
            'phone_number' => $order->phone_number,
            'order_type' => $order->order_type,
            'status' => $order->status,
            'notes' => $order->notes,
            'created_at' => $order->created_at->toIso8601String(),
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'product_name' => $item->product ? $item->product->name : ($item->type ? $item->type : 'Unknown Item'),
                    'options' => $item->options->map(function ($option) {
                        return [
                            'option_label' => $option->option_label,
                            'value_label' => $option->value_label,
                        ];
                    })->toArray(),
                ];
            })->toArray(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $orderData,
        ]);
    }
}
