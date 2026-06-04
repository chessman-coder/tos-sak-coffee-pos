<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Size extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'upcharge',
    ];

    protected $casts = [
        'upcharge' => 'decimal:2',
    ];
}