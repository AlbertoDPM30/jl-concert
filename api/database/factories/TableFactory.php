<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Table;
use App\Models\Chair; 
use Illuminate\Support\Collection; // afterCreating

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Table>
 */
class TableFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Se mantiene la lógica del número de mesa (número de mesa auto-incremental)
        static $tableNumber = 0; 
        $tableNumber++;

        return [
            'number' => $tableNumber, 
            'chair_quantity' => 4, // Asumimos 4 por defecto según lo solicitado
            'status' => 0,
        ];
    }

    /**
     * Configure the model factory.
     * Añadimos la lógica para crear las sillas después de crear la mesa.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Table $table) {
            
            // Lógica para crear 4 sillas por cada mesa
            for ($i = 1; $i <= 4; $i++) {
                Chair::factory()->create([
                    'id_table' => $table->id, // Establece la clave foránea a la mesa recién creada
                    'number' => $i,            // Número secuencial de silla (1 a 4)
                    'status' => 0,
                ]);
            }
            
        });
    }
}