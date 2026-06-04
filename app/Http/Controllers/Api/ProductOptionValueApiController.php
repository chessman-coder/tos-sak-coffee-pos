<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductOptionValue;

class ProductOptionValueApiController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductOptionValue::query();
        if ($request->has('product_option_id')) {
            $query->where('product_option_id', $request->get('product_option_id'));
        }

        return response()->json($query->orderBy('sort_order')->orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_option_id' => 'required|exists:product_options,id',
            'value' => 'required|string|max:255',
            'upcharge' => 'nullable|numeric',
            'sort_order' => 'nullable|integer',
        ]);

        if (!array_key_exists('upcharge', $validated)) {
            $validated['upcharge'] = 0;
        }

        $item = ProductOptionValue::create($validated);

        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'product_option_id' => 'required|exists:product_options,id',
            'value' => 'required|string|max:255',
            'upcharge' => 'nullable|numeric',
            'sort_order' => 'nullable|integer',
        ]);

        if (!array_key_exists('upcharge', $validated)) {
            $validated['upcharge'] = 0;
        }

        $item = ProductOptionValue::findOrFail($id);
        $item->update($validated);

        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = ProductOptionValue::findOrFail($id);
        $item->delete();

        return response()->json(['deleted' => true]);
    }
}
