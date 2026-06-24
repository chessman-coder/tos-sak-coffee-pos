<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Size;
use App\Models\Type;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Categories & Subcategories
        $coffee = Category::create(['name' => 'Coffee', 'parent_id' => null]);
        $espressoBased = Category::create(['name' => 'Espresso-Based', 'parent_id' => $coffee->id]);
        $coldBrew = Category::create(['name' => 'Cold Brew', 'parent_id' => $coffee->id]);

        $nonCoffee = Category::create(['name' => 'Non-Coffee', 'parent_id' => null]);
        $matchaChoc = Category::create(['name' => 'Matcha & Chocolate', 'parent_id' => $nonCoffee->id]);
        $smoothies = Category::create(['name' => 'Smoothies & Juices', 'parent_id' => $nonCoffee->id]);

        $tea = Category::create(['name' => 'Tea', 'parent_id' => null]);
        $hotTea = Category::create(['name' => 'Hot Tea', 'parent_id' => $tea->id]);
        $icedTea = Category::create(['name' => 'Iced Tea', 'parent_id' => $tea->id]);

        $bakery = Category::create(['name' => 'Bakery', 'parent_id' => null]);
        $cakes = Category::create(['name' => 'Cakes', 'parent_id' => $bakery->id]);
        $croissants = Category::create(['name' => 'Croissants', 'parent_id' => $bakery->id]);

        // 2. Seed Sizes
        $sizesData = [
            ['title' => 'Small', 'upcharge' => 0.00],
            ['title' => 'Medium', 'upcharge' => 0.50],
            ['title' => 'Large', 'upcharge' => 1.00],
        ];
        foreach ($sizesData as $sz) {
            Size::create($sz);
        }

        // 3. Seed Types
        $typesData = [
            ['title' => 'Hot'],
            ['title' => 'Iced'],
            ['title' => 'Frappe'],
        ];
        foreach ($typesData as $tp) {
            Type::create($tp);
        }

        // 4. Seed Global Product Options & Values
        // Sugar Level (Required)
        $sugarOpt = ProductOption::create([
            'name' => 'Sugar Level',
            'is_required' => false,
            'sort_order' => 0,
        ]);
        ProductOptionValue::create(['product_option_id' => $sugarOpt->id, 'value' => '100% Sugar', 'upcharge' => 0.00, 'sort_order' => 0]);
        ProductOptionValue::create(['product_option_id' => $sugarOpt->id, 'value' => '50% Sugar', 'upcharge' => 0.00, 'sort_order' => 1]);
        ProductOptionValue::create(['product_option_id' => $sugarOpt->id, 'value' => 'No Sugar', 'upcharge' => 0.00, 'sort_order' => 2]);

        // Ice Level (Optional)
        $iceOpt = ProductOption::create([
            'name' => 'Ice Level',
            'is_required' => false,
            'sort_order' => 1,
        ]);
        ProductOptionValue::create(['product_option_id' => $iceOpt->id, 'value' => 'Normal Ice', 'upcharge' => 0.00, 'sort_order' => 0]);
        ProductOptionValue::create(['product_option_id' => $iceOpt->id, 'value' => 'Less Ice', 'upcharge' => 0.00, 'sort_order' => 1]);
        ProductOptionValue::create(['product_option_id' => $iceOpt->id, 'value' => 'No Ice', 'upcharge' => 0.00, 'sort_order' => 2]);

        // Add-ons (Optional)
        $addonsOpt = ProductOption::create([
            'name' => 'Add-ons',
            'is_required' => false,
            'sort_order' => 2,
        ]);
        ProductOptionValue::create(['product_option_id' => $addonsOpt->id, 'value' => 'Extra Shot', 'upcharge' => 0.75, 'sort_order' => 0]);
        ProductOptionValue::create(['product_option_id' => $addonsOpt->id, 'value' => 'Caramel Drizzle', 'upcharge' => 0.50, 'sort_order' => 1]);
        ProductOptionValue::create(['product_option_id' => $addonsOpt->id, 'value' => 'Whipped Cream', 'upcharge' => 0.50, 'sort_order' => 2]);

        // 5. Seed Products
        $productsData = [
            [
                'name' => 'Americano',
                'category_id' => $espressoBased->id,
                'type' => 'Hot, Iced',
                'size' => 'Small, Medium, Large',
                'price' => 0.01,
                'stock' => 100,
            ],
            [
                'name' => 'Caramel Macchiato',
                'category_id' => $espressoBased->id,
                'type' => 'Hot, Iced, Frappe',
                'size' => 'Small, Medium, Large',
                'price' => 3.50,
                'stock' => 100,
            ],
        ];

        foreach ($productsData as $prod) {
            Product::create($prod);
        }
    }
}
