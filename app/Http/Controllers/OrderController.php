<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    public function index(Request $request): Response
    {
        $rsDatas = Order::with(['items.product', 'items.options'])->latest()->paginate(10)->appends(request()->query());

        return Inertia::render('OrderHistory/Index', [
            'orderData' => $rsDatas,
        ]);
    }

    public function create(): Response
    {
        $products = Product::with(['category'])->orderBy('name')->get(['id', 'name', 'category_id', 'type', 'size', 'price', 'stock', 'image_path']);
        $options = ProductOption::with(['values' => function ($valueQuery) {
            $valueQuery->orderBy('sort_order')->orderBy('id');
        }])->orderBy('sort_order')->orderBy('id')->get();
        foreach ($products as $product) {
            $product->setRelation('options', $options);
        }

        return Inertia::render('Order/CreateEdit', [
            'datas' => ['order_number' => $this->generateOrderNumber()],
            'products' => $products,
        ]);
    }

    public function store(Request $request, Order $model)
    {
        Log::info('Order store request payload', $request->all());

        try {
            $validated = $request->validate([
                'order_number' => 'nullable|max:255|min:2|unique:orders,order_number',
                'customer_name' => 'nullable|string|max:100',
                'phone_number' => 'required_if:order_type,Take Away|nullable|string|max:255',
                'order_type' => 'required|string|in:Dine In,Take Away',
                'order_date' => 'required|date',
                'order_method' => 'required|in:self_order,walk_in_order',
                'payment_method' => 'required|in:khqr,cash',
                'status' => 'required|in:unpaid,pending,preparing,ready,completed,cancelled',
                'notes' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.discount' => 'nullable|numeric|min:0',
                'items.*.type' => 'nullable|string|max:255',
                'items.*.size' => 'nullable|string|max:255',
                'items.*.notes' => 'nullable|string',
                'items.*.selected_options' => 'nullable|array',
                'items.*.selected_options.*.product_option_id' => 'nullable|integer|exists:product_options,id',
                'items.*.selected_options.*.product_option_value_id' => 'nullable|integer|exists:product_option_values,id',
                'items.*.selected_options.*.option_label' => 'nullable|string|max:255',
                'items.*.selected_options.*.value_label' => 'nullable|string|max:255',
                'items.*.selected_options.*.note' => 'nullable|string',
            ]);
        } catch (ValidationException $e) {
            Log::warning('Order validation failed', $e->errors());
            throw $e;
        }

        $createdOrderId = null;
        DB::transaction(function () use ($validated, $model, &$createdOrderId) {
            $items = collect($validated['items']);
            $productIds = $items->pluck('product_id')->unique()->values();
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');
            $options = ProductOption::with(['values' => function ($valueQuery) {
                $valueQuery->orderBy('sort_order')->orderBy('id');
            }])->orderBy('sort_order')->orderBy('id')->get();
            foreach ($products as $product) {
                $product->setRelation('options', $options);
            }

            $optionErrors = $this->validateSelectedOptions($items, $products);
            if ($optionErrors !== []) {
                throw ValidationException::withMessages($optionErrors);
            }

            // Check stock availability for products with defined stock numbers
            $stockErrors = [];
            foreach ($items as $itemIndex => $item) {
                $product = $products->get($item['product_id']);
                if ($product && $product->stock !== null && $product->stock !== '') {
                    $requestedQty = (int) $item['quantity'];
                    $currentStock = (int) $product->stock;
                    if ($currentStock <= 0) {
                        $stockErrors["items.$itemIndex.quantity"] = "{$product->name} is currently out of stock.";
                    } elseif ($requestedQty > $currentStock) {
                        $stockErrors["items.$itemIndex.quantity"] = "Only {$currentStock} items available in stock for {$product->name}.";
                    }
                }
            }

            if ($stockErrors !== []) {
                throw ValidationException::withMessages($stockErrors);
            }

            $totalAmount = 0;
            $orderNumber = $validated['order_number'] ?? $this->generateOrderNumber();
            
            $orderDate = $validated['order_date'] ?? now()->toDateString();
            $maxWaiting = $model->whereDate('order_date', $orderDate)
                ->where('status', '!=', 'cancelled')
                ->max('waiting_number');
            $waitingNumber = ($maxWaiting ?? 0) + 1;

            $order = $model->create([
                'order_number' => $orderNumber,
                'waiting_number' => $waitingNumber,
                'customer_name' => $validated['customer_name'] ?? null,
                'phone_number' => $validated['phone_number'] ?? null,
                'order_type' => $validated['order_type'],
                'order_date' => $validated['order_date'],
                'order_method' => $validated['order_method'],
                'payment_method' => $validated['payment_method'],
                'status' => $validated['status'],
                'total_amount' => 0,
                'notes' => $validated['notes'] ?? null,
            ]);

            $sizes = \App\Models\Size::all();
            foreach ($items as $item) {
                $product = $products->get($item['product_id']);
                $unitPrice = $this->calculateItemUnitPrice($product, $item, $sizes);
                $quantity = (int) $item['quantity'];
                $discount = (float) ($item['discount'] ?? 0);
                $lineTotal = max(($unitPrice * $quantity) - $discount, 0);

                $orderItem = $order->items()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'type' => $item['type'] ?? null,
                    'size' => $item['size'] ?? null,
                    'notes' => $item['notes'] ?? null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $unitPrice * $quantity,
                    'discount' => $discount,
                    'line_total' => $lineTotal,
                ]);

                $this->syncOrderItemOptions($orderItem, $product, $item['selected_options'] ?? []);

                // Decrease stock count if stock is tracked for this product
                if ($product->stock !== null && $product->stock !== '') {
                    $currentStock = (int) $product->stock;
                    $newStock = max(0, $currentStock - $quantity);
                    $product->update(['stock' => $newStock]);
                }

                $totalAmount += $lineTotal;
            }

            $createdOrderId = $order->id;
            $order->update(['total_amount' => $totalAmount]);
            Log::info('Order created', ['order_id' => $createdOrderId, 'total' => $totalAmount]);
        });

        if ($validated['payment_method'] === 'khqr' || $validated['payment_method'] === 'cash') {
            return redirect()->route('checkout', ['id' => $createdOrderId]);
        }

        return redirect()->route('orders.index');
    }

    public function update(Request $request, Order $model, $id)
    {
        $rsDatasModel = Order::findOrFail($id);

        $validated = $request->validate([
            'order_number' => 'required|max:255|min:2|unique:orders,order_number,' . $id,
            'customer_name' => 'nullable|string|max:100',
            'phone_number' => 'required_if:order_type,Take Away|nullable|string|max:255',
            'order_type' => 'required|string|in:Dine In,Take Away',
            'order_date' => 'required|date',
            'order_method' => 'required|in:self_order,walk_in_order',
            'payment_method' => 'required|in:khqr,cash',
            'status' => 'required|in:unpaid,pending,preparing,ready,completed,cancelled',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.discount' => 'nullable|numeric|min:0',
            'items.*.type' => 'nullable|string|max:255',
            'items.*.size' => 'nullable|string|max:255',
            'items.*.notes' => 'nullable|string',
            'items.*.selected_options' => 'nullable|array',
            'items.*.selected_options.*.product_option_id' => 'nullable|integer|exists:product_options,id',
            'items.*.selected_options.*.product_option_value_id' => 'nullable|integer|exists:product_option_values,id',
            'items.*.selected_options.*.option_label' => 'nullable|string|max:255',
            'items.*.selected_options.*.value_label' => 'nullable|string|max:255',
            'items.*.selected_options.*.note' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $rsDatasModel) {
            $items = collect($validated['items']);
            $productIds = $items->pluck('product_id')->unique()->values();
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');
            $options = ProductOption::with(['values' => function ($valueQuery) {
                $valueQuery->orderBy('sort_order')->orderBy('id');
            }])->orderBy('sort_order')->orderBy('id')->get();
            foreach ($products as $product) {
                $product->setRelation('options', $options);
            }

            $optionErrors = $this->validateSelectedOptions($items, $products);
            if ($optionErrors !== []) {
                throw ValidationException::withMessages($optionErrors);
            }

            $totalAmount = 0;
            $rsDatasModel->update([
                'order_number' => $validated['order_number'],
                'customer_name' => $validated['customer_name'] ?? null,
                'phone_number' => $validated['phone_number'] ?? null,
                'order_type' => $validated['order_type'],
                'order_date' => $validated['order_date'],
                'order_method' => $validated['order_method'],
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
                    'type' => $item['type'] ?? null,
                    'size' => $item['size'] ?? null,
                    'notes' => $item['notes'] ?? null,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $unitPrice * $quantity,
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
        if ($rsDatasModel) {
            if ($rsDatasModel->status === 'Order Cancelled') {
                $rsDatasModel->delete();
            }
        }

        if (request()->header('referer') && str_contains(request()->header('referer'), '/checkout')) {
            return redirect()->route('pos.index')->with('message', 'Order Cancelled');
        }

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
                'note' => $selectedOption['note'] ?? null,
            ]);
        }
    }

    private function calculateItemUnitPrice(Product $product, array $item, $sizes): float
    {
        $basePrice = (float) $product->price;

        $sizeUpcharge = 0.0;
        if (!empty($item['size'])) {
            $matchingSize = $sizes->first(function ($s) use ($item) {
                return strtolower($s->title) === strtolower($item['size']);
            });
            if ($matchingSize) {
                $sizeUpcharge = (float) $matchingSize->upcharge;
            }
        }

        $optionsUpcharge = 0.0;
        $selectedOpts = $item['selected_options'] ?? [];
        if (!empty($selectedOpts)) {
            foreach ($selectedOpts as $selectedOption) {
                $productOptionValueId = isset($selectedOption['product_option_value_id'])
                    ? (int) $selectedOption['product_option_value_id']
                    : null;
                if ($productOptionValueId) {
                    foreach ($product->options as $productOption) {
                        $val = $productOption->values->firstWhere('id', $productOptionValueId);
                        if ($val) {
                            $optionsUpcharge += (float) $val->upcharge;
                            break;
                        }
                    }
                }
            }
        }

        return $basePrice + $sizeUpcharge + $optionsUpcharge;
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
