<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('types', 'values')) {
            Schema::table('types', function (Blueprint $table) {
                $table->dropColumn('values');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('types', 'values')) {
            Schema::table('types', function (Blueprint $table) {
                $table->json('values')->nullable()->after('title');
            });
        }
    }
};