<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $primarykey = 'id';

    protected $fillable = [
        'order_number',
        'waiting_number',
        'customer_name',
        'phone_number',
        'order_type',
        'order_date',
        'order_method',
        'payment_method',
        'status',
        'total_amount',
        'notes',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}