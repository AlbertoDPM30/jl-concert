<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Table;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crea 120 mesas de ejemplo usando el TableFactory
        Table::factory()->count(120)->create(); 
    }
}