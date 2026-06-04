<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductOptionApiController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductOption::query()->with(['values' => function ($valueQuery) {
            $valueQuery->orderBy('sort_order')->orderBy('id');
        }])->orderBy('sort_order')->orderBy('id');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->get('product_id'));
        }

        return response()->json($query->get(['id', 'product_id', 'name', 'is_required', 'sort_order']));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255|min:1',
            'is_required' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'values' => 'nullable|array',
            'values.*.id' => 'nullable|integer|exists:product_option_values,id',
            'values.*.value' => 'required_with:values|string|max:255',
            'values.*.upcharge' => 'nullable|numeric',
            'values.*.sort_order' => 'nullable|integer',
        ]);

        if (!array_key_exists('is_required', $validated)) {
            $validated['is_required'] = false;
        }

        $option = DB::transaction(function () use ($validated) {
            $option = ProductOption::create([
                'product_id' => $validated['product_id'],
                'name' => $validated['name'],
                'is_required' => $validated['is_required'],
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            $this->syncOptionValues($option, $validated['values'] ?? []);

            return $option->load('values');
        });

        return response()->json($option, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255|min:1',
            'is_required' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'values' => 'nullable|array',
            'values.*.id' => 'nullable|integer|exists:product_option_values,id',
            'values.*.value' => 'required_with:values|string|max:255',
            'values.*.upcharge' => 'nullable|numeric',
            'values.*.sort_order' => 'nullable|integer',
        ]);

        if (!array_key_exists('is_required', $validated)) {
            $validated['is_required'] = false;
        }

        $option = ProductOption::findOrFail($id);

        DB::transaction(function () use ($option, $validated) {
            $option->update([
                'product_id' => $validated['product_id'],
                'name' => $validated['name'],
                'is_required' => $validated['is_required'],
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            $this->syncOptionValues($option, $validated['values'] ?? []);
        });

        return response()->json($option->load('values'));
    }

    public function destroy($id)
    {
        $option = ProductOption::findOrFail($id);
        $option->delete();

        return response()->json(['deleted' => true]);
    }

    private function syncOptionValues(ProductOption $option, array $values): void
    {
        $existingValues = $option->values()->get()->keyBy('id');
        $incomingValueIds = [];

        foreach (array_values($values) as $valueIndex => $valueData) {
            $valueId = isset($valueData['id']) ? (int) $valueData['id'] : null;

            $value = $valueId && $existingValues->has($valueId)
                ? $existingValues->get($valueId)
                : $option->values()->make();

            $value->fill([
                'value' => $valueData['value'],
                'upcharge' => $valueData['upcharge'] ?? 0,
                'sort_order' => $valueIndex,
            ]);
            $value->option()->associate($option);
            $value->save();

            $incomingValueIds[] = $value->id;
        }

        if ($incomingValueIds === []) {
            $option->values()->delete();
        } else {
            $option->values()->whereNotIn('id', $incomingValueIds)->delete();
        }
    }
}
