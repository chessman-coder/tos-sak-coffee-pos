<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
    protected $table = 'products';
    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'category_id',
        'type',
        'size',
        'price',
        'stock',
        'image_path',
    ];

    public function getOptionsAttribute()
    {
        if ($this->relationLoaded('options')) {
            return $this->getRelation('options');
        }
        return ProductOption::with('values')->orderBy('sort_order')->orderBy('id')->get();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    protected static function booted()
    {
        static::saved(function ($product) {
            if ($product->wasRecentlyCreated || $product->wasChanged('stock')) {
                if ($product->stock !== null) {
                    try {
                        app(\App\Services\TelegramService::class)->sendLowStockAlert($product);
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::error('Failed to trigger low stock alert for product ' . $product->id . ': ' . $e->getMessage(), ['exception' => $e]);
                    }
                }
            }
        });
    }
}
