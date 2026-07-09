<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Inventory extends Model
{
    use HasFactory;
    protected $table = 'inventories';
    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'category',
        'image_path',
        'unit',
        'stock',
        'status',
        'reorder_level',
        'unit_cost',
        'inventory_value',
        'supplier',
    ];

    protected $casts = [
        'status' => 'boolean',
        'stock' => 'integer',
        'reorder_level' => 'integer',
        'unit_cost' => 'decimal:2',
        'inventory_value' => 'decimal:2',
    ];

    public function setInventoryValueAttribute($value): void
    {
        $this->attributes['inventory_value'] = $value;
        $this->attributes['invetory_value'] = $value;
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    protected static function booted()
    {
        static::saved(function ($inventory) {
            if ($inventory->wasRecentlyCreated || $inventory->wasChanged('stock')) {
                try {
                    app(\App\Services\TelegramService::class)->sendLowStockAlert($inventory);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to trigger low stock alert for inventory item ' . $inventory->id . ': ' . $e->getMessage(), ['exception' => $e]);
                }
            }
        });
    }
}
