<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('name')->constrained('categories')->nullOnDelete();
            }

            if (!Schema::hasColumn('products', 'type')) {
                $table->string('type')->nullable()->after('category_id');
            }

            if (!Schema::hasColumn('products', 'size')) {
                $table->string('size')->nullable()->after('type');
            }

            if (!Schema::hasColumn('products', 'stock')) {
                $table->integer('stock')->nullable()->after('price');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'stock')) {
                $table->dropColumn('stock');
            }

            if (Schema::hasColumn('products', 'size')) {
                $table->dropColumn('size');
            }

            if (Schema::hasColumn('products', 'type')) {
                $table->dropColumn('type');
            }

            if (Schema::hasColumn('products', 'category_id')) {
                $table->dropConstrainedForeignId('category_id');
            }
        });
    }
};