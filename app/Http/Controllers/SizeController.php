<?php

namespace App\Http\Controllers;

use App\Models\Size;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SizeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $rsDatas = Size::latest()->paginate(10)->appends(request()->query());

        return Inertia::render('Sizes/Index', [
            'sizeData' => $rsDatas,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Sizes/CreateEdit', [
            'datas' => (object) [],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Size $model)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:2',
        ]);

        $model->create($validated);

        return redirect()->route('sizes.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Size $size, $id)
    {
        $rsDatasModel = Size::findOrFail($id);

        return Inertia::render('Sizes/CreateEdit', [
            'datas' => $rsDatasModel,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Size $model, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:2',
        ]);

        $rsDatasModel = Size::findOrFail($id);
        $rsDatasModel->update($validated);

        return redirect()->route('sizes.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Size $size, $id)
    {
        $rsDatasModel = Size::findOrFail($id);
        $rsDatasModel->delete();

        return back()->with('message', 'Deleted successfully');
    }
}