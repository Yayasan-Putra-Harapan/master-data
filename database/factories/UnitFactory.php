<?php

namespace Database\Factories;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Unit::class;

    public function definition(): array
    {
        $code = strtoupper($this->faker->unique()->lexify('???'));
        return [
            'kode_unit' => $code,
            'nama_unit' => 'Unit ' . $this->faker->words(2, true),
            'jenjang' => $this->faker->randomElement(['PG', 'TK', 'SD', 'SMP', 'SMA', 'BOARDING']),
            'alamat' => $this->faker->address(),
            'telepon' => $this->faker->numerify('08##########'),
            'email' => $this->faker->unique()->safeEmail(),
            'kepala_sekolah' => $this->faker->name(),
            'is_aktif' => true,
        ];
    }
}
