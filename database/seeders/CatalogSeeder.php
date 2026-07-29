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
        $espresso = Category::create(['name' => 'Espresso', 'parent_id' => $coffee->id]);
        $milkCoffee = Category::create(['name' => 'Milk Coffee', 'parent_id' => $coffee->id]);
        $flavoredCoffee = Category::create(['name' => 'Flavored Coffee', 'parent_id' => $coffee->id]);

        $nonCoffee = Category::create(['name' => 'Non-Coffee', 'parent_id' => null]);
        $juice = Category::create(['name' => 'Juice', 'parent_id' => $nonCoffee->id]);
        $milk = Category::create(['name' => 'Milk', 'parent_id' => $nonCoffee->id]);

        $tea = Category::create(['name' => 'Tea', 'parent_id' => null]);
        $brewed = Category::create(['name' => 'Brewed Tea', 'parent_id' => $tea->id]);
        $fruit = Category::create(['name' => 'Fruit Tea', 'parent_id' => $tea->id]);

        $milkTea = Category::create(['name' => 'Milk Tea', 'parent_id' => null]);
        $classic = Catagory::create(['name' => 'Classic', 'parent_id' => $milkTea->id]);
        $flavored = Category::creat(['name' => 'Flavored', 'parent_id' => $milkTea->id]);

        $desserts = Category::create(['name' => 'Desserts', 'parent_id' => null]);
        $cakes = Category::create(['name' => 'Cakes', 'parent_id' => $desserts->id]);
        $pastries = Category::create(['name' => 'Pastries', 'parent_id' => $desserts->id]);
        $Cookies = Category::create(['name' => 'Cookies', 'parent_id' => $desserts->id]);
        

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
        ProductOptionValue::create(['product_option_id' => $sugarOpt->id, 'value' => '75% Sugar', 'upcharge' => 0.00, 'sort_order' => 1]);
        ProductOptionValue::create(['product_option_id' => $sugarOpt->id, 'value' => '50% Sugar', 'upcharge' => 0.00, 'sort_order' => 2]);
        ProductOptionValue::create(['product_option_id' => $sugarOpt->id, 'value' => '25% Sugar', 'upcharge' => 0.00, 'sort_order' => 3]);
        ProductOptionValue::create(['product_option_id' => $sugarOpt->id, 'value' => 'No Sugar', 'upcharge' => 0.00, 'sort_order' => 4]);

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

        foreach ($productsData as $prod) {
            Product::create($prod);
        }
    }
}
