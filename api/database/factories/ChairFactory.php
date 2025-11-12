<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Chair; // Asegúrate de importar el modelo Chair
use App\Models\Table;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Chair>
 */
class ChairFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Los campos 'id_table', 'number' y 'status' serán sobrescritos
        // por la función afterCreating del TableFactory, pero se definen aquí
        // para tener un factory base si se usara individualmente.
        return [
            'id_table' => Table::factory(), // Opcional: define una relación por defecto
            'number' => $this->faker->numberBetween(1, 5),
            'status' => $this->faker->numberBetween(0, 1),
        ];
    }
}