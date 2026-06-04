<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Type;

class TypeApiController extends Controller
{
    public function index()
    {
        return response()->json(Type::orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:1',
        ]);

        $type = Type::create($validated);

        return response()->json($type, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:1',
        ]);

        $type = Type::findOrFail($id);
        $type->update($validated);

        return response()->json($type);
    }

    public function destroy($id)
    {
        $type = Type::findOrFail($id);
        $type->delete();

        return response()->json(['deleted' => true]);
    }
}
