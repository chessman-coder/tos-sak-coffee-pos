<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Generate a unique order number in format ORD-XXX
     */
    private function generateOrderNumber(): string
    {
        // Find the current max numeric suffix for order numbers like ORD-001
        $max = DB::table('orders')
            ->where('order_number', 'like', 'ORD-%')
            ->selectRaw("MAX(CAST(REPLACE(order_number, 'ORD-', '') AS UNSIGNED)) as max_no")
            ->value('max_no');

        $next = ($max ? (int) $max + 1 : 1);
        $suffix = str_pad($next, 3, '0', STR_PAD_LEFT);
        $num = 'ORD-' . $suffix;

        // ensure uniqueness
        while (Order::where('order_number', $num)->exists()) {
            $next++;
            $suffix = str_pad($next, 3, '0', STR_PAD_LEFT);
            $num = 'ORD-' . $suffix;
        }

        return $num;
    }

    public function index(Request $request): Response
    {
        $rsDatas = Order::with(['items.product', 'items.options'])->latest()->paginate(10)->appends(request()->query());

        return Inertia::render('Order/Index', [
            'orderData' => $rsDatas,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Order/CreateEdit', [
            'datas' => [ 'order_number' => $this->generateOrderNumber() ],
            'products' => Product::with(['category', 'options.values'])->orderBy('name')->get(['id', 'name', 'category_id', 'type', 'size', 'price', 'stock', 'image_path']),
        ]);
    }

    public function store(Request $request, Order $model)
    {
        // Log incoming payload for debugging
        Log::info('Order store request payload', $request->all());

        try {
            $validated = $request->validate([
                'order_number' => 'nullable|max:255|min:2|unique:orders,order_number',
                'order_date' => 'required|date',
                'order_method' => 'required|in:qr_order,walk_in_order',
                'table_number' => 'nullable|required_if:order_method,qr_order|max:50',
                'payment_method' => 'required|in:khqr,cash',
                'status' => 'required|in:pending,preparing,finish',
                'notes' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.discount' => 'nullable|numeric|min:0',
                'items.*.selected_options' => 'nullable|array',
                'items.*.selected_options.*.product_option_id' => 'nullable|integer|exists:product_options,id',
                'items.*.selected_options.*.product_option_value_id' => 'nullable|integer|exists:product_option_values,id',
                'items.*.selected_options.*.option_label' => 'nullable|string|max:255',
                'items.*.selected_options.*.value_label' => 'nullable|string|max:255',
            ]);
        } catch (ValidationException $e) {
            Log::warning('Order validation failed', $e->errors());
            throw $e;
        }

        $createdOrderId = null;
        DB::transaction(function () use ($validated, $model, &$createdOrderId) {
            $items = collect($validated['items']);
            $productIds = $items->pluck('product_id')->unique()->values();
            $products = Product::with(['options.values'])->whereIn('id', $productIds)->get()->keyBy('id');

            $optionErrors = $this->validateSelectedOptions($items, $products);
            if ($optionErrors !== []) {
                throw ValidationException::withMessages($optionErrors);
            }

            $totalAmount = 0;
            $orderNumber = $validated['order_number'] ?? $this->generateOrderNumber();

            $order = $model->create([
                'order_number' => $orderNumber,
                'order_date' => $validated['order_date'],
                'order_method' => $validated['order_method'],
                'table_number' => $validated['order_method'] === 'qr_order' ? $validated['table_number'] : null,
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'total_amount' => 0,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                $unitPrice = (float) $product->price;
                $quantity = (int) $item['quantity'];
                $discount = (float) ($item['discount'] ?? 0);
                $lineTotal = max(($unitPrice * $quantity) - $discount, 0);

                $orderItem = $order->items()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount' => $discount,
                    'line_total' => $lineTotal,
                ]);

                $this->syncOrderItemOptions($orderItem, $product, $item['selected_options'] ?? []);

                $totalAmount += $lineTotal;
            }

            $createdOrderId = $order->id;
            $order->update(['total_amount' => $totalAmount]);
            Log::info('Order created', ['order_id' => $createdOrderId, 'total' => $totalAmount]);
        });

        return redirect()->route('orders.index');
    }

    public function edit(Order $order, $id): Response
    {
        $rsDatasModel = Order::with(['items.options'])->find($id);

        return Inertia::render('Order/CreateEdit', [
            'datas' => $rsDatasModel,
            'products' => Product::with(['category', 'options.values'])->orderBy('name')->get(['id', 'name', 'category_id', 'type', 'size', 'price', 'stock', 'image_path']),
        ]);
    }

    public function update(Request $request, Order $model, $id)
    {
        $rsDatasModel = Order::findOrFail($id);

        $validated = $request->validate([
            'order_number' => 'required|max:255|min:2|unique:orders,order_number,' . $id,
            'order_date' => 'required|date',
            'order_method' => 'required|in:qr_order,walk_in_order',
            'table_number' => 'nullable|required_if:order_method,qr_order|max:50',
            'payment_method' => 'required|in:khqr,cash',
            'status' => 'required|in:pending,preparing,finish',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.discount' => 'nullable|numeric|min:0',
            'items.*.selected_options' => 'nullable|array',
            'items.*.selected_options.*.product_option_id' => 'nullable|integer|exists:product_options,id',
            'items.*.selected_options.*.product_option_value_id' => 'nullable|integer|exists:product_option_values,id',
            'items.*.selected_options.*.option_label' => 'nullable|string|max:255',
            'items.*.selected_options.*.value_label' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $rsDatasModel) {
            $items = collect($validated['items']);
            $productIds = $items->pluck('product_id')->unique()->values();
            $products = Product::with(['options.values'])->whereIn('id', $productIds)->get()->keyBy('id');

            $optionErrors = $this->validateSelectedOptions($items, $products);
            if ($optionErrors !== []) {
                throw ValidationException::withMessages($optionErrors);
            }

            $totalAmount = 0;
            $rsDatasModel->update([
                'order_number' => $validated['order_number'],
                'order_date' => $validated['order_date'],
                'order_method' => $validated['order_method'],
                'table_number' => $validated['order_method'] === 'qr_order' ? $validated['table_number'] : null,
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            $rsDatasModel->items()->delete();

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                $unitPrice = (float) $product->price;
                $quantity = (int) $item['quantity'];
                $discount = (float) ($item['discount'] ?? 0);
                $lineTotal = max(($unitPrice * $quantity) - $discount, 0);

                $orderItem = $rsDatasModel->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount' => $discount,
                    'line_total' => $lineTotal,
                ]);

                $this->syncOrderItemOptions($orderItem, $product, $item['selected_options'] ?? []);

                $totalAmount += $lineTotal;
            }

            $rsDatasModel->update(['total_amount' => $totalAmount]);
        });

        return redirect()->route('orders.index');
    }

    public function destroy(Order $order, $id)
    {
        $rsDatasModel = Order::find($id);
        $rsDatasModel->delete();

        return back()->with('message', 'Deleted successfully');
    }

    private function syncOrderItemOptions(OrderItem $orderItem, Product $product, array $selectedOptions): void
    {
        if ($selectedOptions === []) {
            return;
        }

        $productOptions = $product->options->keyBy('id');

        foreach (array_values($selectedOptions) as $optionIndex => $selectedOption) {
            $productOptionId = isset($selectedOption['product_option_id']) ? (int) $selectedOption['product_option_id'] : null;
            $productOptionValueId = isset($selectedOption['product_option_value_id']) ? (int) $selectedOption['product_option_value_id'] : null;
            $productOption = $productOptionId ? $productOptions->get($productOptionId) : null;
            $productOptionValue = $productOption && $productOptionValueId
                ? $productOption->values->firstWhere('id', $productOptionValueId)
                : null;

            if (!$productOption || !$productOptionValue) {
                continue;
            }

            $orderItem->options()->create([
                'product_option_id' => $productOption->id,
                'product_option_value_id' => $productOptionValue->id,
                'option_label' => $productOption->name,
                'value_label' => $productOptionValue->value,
                'sort_order' => $optionIndex,
            ]);
        }
    }

    private function validateSelectedOptions($items, $products): array
    {
        $errors = [];

        foreach ($items as $itemIndex => $item) {
            $product = $products->get($item['product_id']);

            if (!$product) {
                continue;
            }

            $selectedOptions = collect($item['selected_options'] ?? []);

            foreach ($product->options as $productOption) {
                $selection = $selectedOptions->first(function ($selectedOption) use ($productOption) {
                    return (int) ($selectedOption['product_option_id'] ?? 0) === (int) $productOption->id;
                });

                if ($productOption->is_required && (!$selection || empty($selection['product_option_value_id']))) {
                    $errors["items.$itemIndex.selected_options"] = $productOption->name . ' is required.';
                    continue;
                }

                if ($selection && !empty($selection['product_option_value_id'])) {
                    $selectedValueId = (int) $selection['product_option_value_id'];
                    $valueExists = $productOption->values->contains('id', $selectedValueId);

                    if (!$valueExists) {
                        $errors["items.$itemIndex.selected_options"] = 'Invalid option selected for ' . $productOption->name . '.';
                    }
                }
            }
        }

        return $errors;
    }
}
