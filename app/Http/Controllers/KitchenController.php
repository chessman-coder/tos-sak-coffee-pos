<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KitchenController extends Controller
{
    /**
     * Display the Kitchen Queue Dashboard
     */
    public function index(): Response
    {
        return Inertia::render('Kitchen/Dashboard');
    }
}
