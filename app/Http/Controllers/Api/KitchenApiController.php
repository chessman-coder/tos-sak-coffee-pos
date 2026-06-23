<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Repositories\OrderRepositoryInterface;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KitchenApiController extends Controller
{
    protected OrderService $orderService;
    protected OrderRepositoryInterface $orderRepository;

    public function __construct(OrderService $orderService, OrderRepositoryInterface $orderRepository)
    {
        $this->orderService = $orderService;
        $this->orderRepository = $orderRepository;
    }

    /**
     * Get active kitchen orders (pending, preparing, ready)
     */
    public function index(): JsonResponse
    {
        $orders = $this->orderRepository->getKitchenQueue();

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
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

        $order = $this->orderService->updateOrderStatus($id, $validated['status']);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => new OrderResource($order),
        ]);
    }
}
