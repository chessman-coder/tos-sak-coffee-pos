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
        Schema::table('inventory_movements', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_movements', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->after('stock_after');
            }

            if (Schema::hasColumn('inventory_movements', 'admin_name')) {
                $table->dropColumn('admin_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_movements', 'admin_name')) {
                $table->string('admin_name')->after('stock_after');
            }

            if (Schema::hasColumn('inventory_movements', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }
        });
    }
};
