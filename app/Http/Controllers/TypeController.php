<?php

namespace App\Http\Controllers;

use App\Models\Type;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $rsDatas = Type::latest()->paginate(10)->appends(request()->query());

        return Inertia::render('Types/Index', [
            'typeData' => $rsDatas,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Types/CreateEdit', [
            'datas' => (object) [],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Type $model)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:2',
        ]);

        $model->create($validated);

        return redirect()->route('types.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Type $type, $id)
    {
        $rsDatasModel = Type::findOrFail($id);

        return Inertia::render('Types/CreateEdit', [
            'datas' => $rsDatasModel,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Type $model, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|min:2',
        ]);

        $rsDatasModel = Type::findOrFail($id);
        $rsDatasModel->update($validated);

        return redirect()->route('types.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Type $type, $id)
    {
        $rsDatasModel = Type::findOrFail($id);
        $rsDatasModel->delete();

        return back()->with('message', 'Deleted successfully');
    }
}