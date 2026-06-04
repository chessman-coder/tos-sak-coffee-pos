<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Size;

class SizeApiController extends Controller
{
    public function index()
    {
        return response()->json(Size::orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:1',
            'upcharge' => 'nullable|numeric',
        ]);

        // Ensure upcharge has a default of 0 if not provided
        if (!array_key_exists('upcharge', $validated)) {
            $validated['upcharge'] = 0;
        }

        $size = Size::create($validated);

        return response()->json($size, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:1',
            'upcharge' => 'nullable|numeric',
        ]);

        $size = Size::findOrFail($id);
        $size->update($validated);

        return response()->json($size);
    }

    public function destroy($id)
    {
        $size = Size::findOrFail($id);
        $size->delete();

        return response()->json(['deleted' => true]);
    }
}
