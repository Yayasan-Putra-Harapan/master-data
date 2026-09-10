<?php

namespace Database\Factories;

use App\Models\Bangunan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bangunan>
 */
class BangunanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Bangunan::class;

    public function definition(): array
    {
        $huruf = strtoupper($this->faker->unique()->lexify('?'));
        return [
            'kode_bangunan' => "GDG-{$huruf}-" . $this->faker->unique()->numberBetween(10, 99),
            'nama_bangunan' => 'Gedung ' . $this->faker->randomElement(['Utama', 'Aisyah', 'Umar bin Khattab', 'Abu Bakar', 'Laboratorium Terpadu', 'Perpustakaan']),
            'unit_id' => \App\Models\Unit::inRandomOrder()->value('id') ?? \App\Models\Unit::factory(),
            'jumlah_lantai' => $this->faker->numberBetween(1, 4),
            'luas' => $this->faker->randomFloat(2, 200, 1500),
            'kondisi' => $this->faker->randomElement(['baik', 'baik', 'baik', 'rusak_ringan']),
            'keterangan' => $this->faker->optional()->sentence(),
        ];
    }
}
