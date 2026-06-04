<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            if (! Schema::hasColumn('inventories', 'category')) {
                $table->string('category')->nullable()->after('name');
            }

            if (! Schema::hasColumn('inventories', 'image_path')) {
                $table->string('image_path')->nullable()->after('category');
            }

            if (! Schema::hasColumn('inventories', 'unit')) {
                $table->string('unit')->nullable()->after('category');
            }

            if (! Schema::hasColumn('inventories', 'reorder_level')) {
                $table->integer('reorder_level')->default(0)->after('stock');
            }

            if (! Schema::hasColumn('inventories', 'unit_cost')) {
                $table->decimal('unit_cost', 12, 2)->default(0)->after('reorder_level');
            }

            if (! Schema::hasColumn('inventories', 'inventory_value')) {
                $table->decimal('inventory_value', 12, 2)->default(0)->after('unit_cost');
            }

            if (! Schema::hasColumn('inventories', 'supplier')) {
                $table->string('supplier')->nullable()->after('inventory_value');
            }

            if (! Schema::hasColumn('inventories', 'status')) {
                $table->boolean('status')->default(true)->after('stock');
            }
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained('inventories')->cascadeOnDelete();
            $table->enum('direction', ['in', 'out']);
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('stock_before');
            $table->unsignedInteger('stock_after');
            $table->string('admin_name');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');

        Schema::table('inventories', function (Blueprint $table) {
            $columns = [];

            foreach (['category', 'unit', 'reorder_level', 'unit_cost', 'inventory_value', 'supplier'] as $column) {
                if (Schema::hasColumn('inventories', $column)) {
                    $columns[] = $column;
                }
            }

            if (Schema::hasColumn('inventories', 'image_path')) {
                $columns[] = 'image_path';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
