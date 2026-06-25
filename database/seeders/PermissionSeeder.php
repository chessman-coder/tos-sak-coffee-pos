<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'manage role',
            'manage user',
            'manage product',
            'manage inventory',
            'manage pos checkout',
        ];

        foreach ($permissions as $permission) {
            $old_permission = Permission::where('name', $permission)->first();
            if (!$old_permission) {
                Permission::create(['name' => $permission]);
            }
        }
    }
}
