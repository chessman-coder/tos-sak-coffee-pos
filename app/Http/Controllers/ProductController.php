<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Size;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $rsDatas = Product::with(['category.parent', 'options.values'])->latest()->paginate(10)->appends(request()->query());

        return Inertia::render('Products/Index', [
            'productData' => $rsDatas,
            'categories' => $this->parentCategoryOptions(),
            'subCategories' => $this->subCategoryOptions(),
            'types' => Type::orderBy('title')->get(['id', 'title']),
            'sizes' => Size::orderBy('title')->get(['id', 'title']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Products/CreateEdit', [
            'datas' => ['options' => []],
            'categories' => $this->subCategoryOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Product $model)
    {
        $validated = $request->validate([
            'name' => 'required|max:255|min:2',
            'category_id' => 'required|exists:categories,id',
            'type' => 'nullable|string|max:255',
            'sizes' => 'nullable|array',
            'sizes.*' => 'nullable|string|max:255',
            'price' => 'required|numeric',
            'stock' => 'nullable|integer',
            'image' => 'nullable|image|max:2048',
            'options' => 'nullable|array',
            'options.*.id' => 'nullable|integer|exists:product_options,id',
            'options.*.name' => 'required_with:options|string|max:255',
            'options.*.is_required' => 'nullable|boolean',
            'options.*.values' => 'required_with:options|array|min:1',
            'options.*.values.*.id' => 'nullable|integer|exists:product_option_values,id',
            'options.*.values.*.value' => 'required_with:options|string|max:255',
        ]);

        $imagePath = $request->file('image')
            ? $request->file('image')->store('products', 'public')
            : null;

        DB::transaction(function () use ($model, $validated, $imagePath) {
            $product = $model->create([
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'type' => $validated['type'] ?? null,
                'size' => $this->formatSizes($validated['sizes'] ?? []),
                'price' => $validated['price'],
                'stock' => $validated['stock'] ?? null,
                'image_path' => $imagePath,
            ]);

            $this->syncProductOptions($product, $validated['options'] ?? []);
        });

        return redirect()->route('products.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product, $id)
    {
        $rsDatasModel = Product::with('options.values')->findOrFail($id);
        return Inertia::render('Products/CreateEdit', [
            'datas' => $rsDatasModel,
            'categories' => $this->subCategoryOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $model, $id)
    {
        $validated = $request->validate([
            'name' => 'required|max:255|min:2',
            'category_id' => 'required|exists:categories,id',
            'type' => 'nullable|string|max:255',
            'sizes' => 'nullable|array',
            'sizes.*' => 'nullable|string|max:255',
            'price' => 'required|numeric',
            'stock' => 'nullable|integer',
            'image' => 'nullable|image|max:2048',
            'options' => 'nullable|array',
            'options.*.id' => 'nullable|integer|exists:product_options,id',
            'options.*.name' => 'required_with:options|string|max:255',
            'options.*.is_required' => 'nullable|boolean',
            'options.*.values' => 'required_with:options|array|min:1',
            'options.*.values.*.id' => 'nullable|integer|exists:product_option_values,id',
            'options.*.values.*.value' => 'required_with:options|string|max:255',
        ]);
        
        $rsDatasModel = Product::findOrFail($id);
        $imagePath = $rsDatasModel->image_path;

        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            $imagePath = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($rsDatasModel, $validated, $imagePath) {
            $rsDatasModel->update([
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'type' => $validated['type'] ?? null,
                'size' => $this->formatSizes($validated['sizes'] ?? []),
                'price' => $validated['price'],
                'stock' => $validated['stock'] ?? null,
                'image_path' => $imagePath,
            ]);

            $this->syncProductOptions($rsDatasModel, $validated['options'] ?? []);
        });

        return redirect()->route('products.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product, $id)
    {
        $rsDatasModel = Product::find($id);
        if ($rsDatasModel?->image_path) {
            Storage::disk('public')->delete($rsDatasModel->image_path);
        }
        $rsDatasModel->delete();

        return back()->with('message', 'Deleted successfully');
    }

    private function syncProductOptions(Product $product, array $options): void
    {
        $existingOptions = $product->options()->with('values')->get()->keyBy('id');
        $incomingOptionIds = [];

        if ($options === []) {
            $product->options()->delete();
            return;
        }

        foreach (array_values($options) as $optionIndex => $optionData) {
            $optionId = isset($optionData['id']) ? (int) $optionData['id'] : null;

            $option = $optionId && $existingOptions->has($optionId)
                ? $existingOptions->get($optionId)
                : $product->options()->make();

            $option->fill([
                'name' => $optionData['name'],
                'is_required' => (bool) ($optionData['is_required'] ?? false),
                'sort_order' => $optionIndex,
            ]);
            $option->product()->associate($product);
            $option->save();

            $incomingOptionIds[] = $option->id;
            $existingValues = $option->values()->get()->keyBy('id');
            $incomingValueIds = [];

            foreach (array_values($optionData['values'] ?? []) as $valueIndex => $valueData) {
                $valueId = isset($valueData['id']) ? (int) $valueData['id'] : null;

                $value = $valueId && $existingValues->has($valueId)
                    ? $existingValues->get($valueId)
                    : $option->values()->make();

                $value->fill([
                    'value' => $valueData['value'],
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

        $product->options()->whereNotIn('id', $incomingOptionIds)->delete();
    }

    private function formatSizes(array $sizes): ?string
    {
        $values = collect($sizes)
            ->map(fn ($size) => trim((string) $size))
            ->filter()
            ->unique()
            ->values();

        return $values->isEmpty() ? null : $values->implode(', ');
    }

    private function parentCategoryOptions()
    {
        return Category::whereNull('parent_id')
            ->whereHas('subcategories')
            ->orderBy('name')
            ->get(['id', 'name', 'parent_id']);
    }

    private function subCategoryOptions()
    {
        return Category::with('parent')
            ->whereNotNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name', 'parent_id']);
    }
}
