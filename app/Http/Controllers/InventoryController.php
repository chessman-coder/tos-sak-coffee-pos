<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\InventoryMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $inventories = Inventory::latest()->get();
        $movements = InventoryMovement::with(['inventory', 'user'])
            ->latest()
            ->limit(25)
            ->get();

        return Inertia::render('Inventories/Index', [
            'inventories' => $inventories,
            'movements' => $movements,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Inventories/Index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|min:2',
            'category' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
            'unit' => 'nullable|string|max:50',
            'stock' => 'required|integer|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
        ]);

        $imagePath = $request->file('image')
            ? $request->file('image')->store('inventories', 'public')
            : null;

        Inventory::create([
            'name' => $validated['name'],
            'category' => $validated['category'] ?? null,
            'image_path' => $imagePath,
            'unit' => $validated['unit'] ?? null,
            'stock' => $validated['stock'],
            'status' => $validated['stock'] > 0,
            'reorder_level' => $validated['reorder_level'] ?? 0,
            'unit_cost' => $validated['unit_cost'] ?? 0,
            'inventory_value' => ($validated['stock'] ?? 0) * ($validated['unit_cost'] ?? 0),
            'supplier' => $validated['supplier'] ?? null,
        ]);

        return back()->with('message', 'Inventory item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        return response()->json($inventory->load('movements.user'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inventory $inventory): Response
    {
        return Inertia::render('Inventories/Index', [
            'inventory' => $inventory->load('movements.user'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inventory $inventory): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|min:2',
                'category' => 'nullable|string|max:255',
                'image' => 'nullable|image|max:2048',
                'unit' => 'nullable|string|max:50',
                'stock' => 'required|integer|min:0',
                'reorder_level' => 'nullable|integer|min:0',
                'unit_cost' => 'nullable|numeric|min:0',
                'supplier' => 'nullable|string|max:255',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Inventory validation failed:', [
                'errors' => $e->errors(),
                'payload' => $request->all()
            ]);
            throw $e;
        }

        $imagePath = $inventory->image_path;

        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            $imagePath = $request->file('image')->store('inventories', 'public');
        }

        $inventory->update([
            'name' => $validated['name'],
            'category' => $validated['category'] ?? null,
            'image_path' => $imagePath,
            'unit' => $validated['unit'] ?? null,
            'stock' => $validated['stock'],
            'status' => $validated['stock'] > 0,
            'reorder_level' => $validated['reorder_level'] ?? 0,
            'unit_cost' => $validated['unit_cost'] ?? 0,
            'inventory_value' => ($validated['stock'] ?? 0) * ($validated['unit_cost'] ?? 0),
            'supplier' => $validated['supplier'] ?? null,
        ]);

        return back()->with('message', 'Inventory item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory): RedirectResponse
    {
        $inventory->delete();

        return back()->with('message', 'Inventory item deleted successfully.');
    }

    public function storeMovement(Request $request, Inventory $inventory): RedirectResponse
    {
        $validated = $request->validate([
            'direction' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        if (! $user) {
            return back()->with('error', 'Unauthenticated');
        }

        $hasUserIdColumn = Schema::hasColumn('inventory_movements', 'user_id');

        DB::transaction(function () use ($inventory, $validated, $user, $hasUserIdColumn) {
            $stockBefore = $inventory->stock;
            $stockAfter = $validated['direction'] === 'in'
                ? $stockBefore + $validated['quantity']
                : max(0, $stockBefore - $validated['quantity']);

            $inventory->update([
                'stock' => $stockAfter,
                'status' => $stockAfter > 0,
                'inventory_value' => $stockAfter * (float) $inventory->unit_cost,
            ]);

            InventoryMovement::create([
                'inventory_id' => $inventory->id,
                'direction' => $validated['direction'],
                'quantity' => $validated['quantity'],
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'note' => $validated['note'] ?? null,
                $hasUserIdColumn ? 'user_id' : 'admin_name' => $hasUserIdColumn ? $user->id : $user->name,
            ]);
        });

        return back()->with('message', 'Stock movement recorded successfully.');
    }
}
