<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItemOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'product_option_id',
        'product_option_value_id',
        'option_label',
        'value_label',
        'sort_order',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function option()
    {
        return $this->belongsTo(ProductOption::class, 'product_option_id');
    }

    public function value()
    {
        return $this->belongsTo(ProductOptionValue::class, 'product_option_value_id');
    }
}