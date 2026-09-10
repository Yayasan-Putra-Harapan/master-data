<?php

namespace Database\Factories;

use App\Models\Ruang;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ruang>
 */
class RuangFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Ruang::class;

    public function definition(): array
    {
        $nomor = $this->faker->unique()->numberBetween(101, 499);
        return [
            'kode_ruang' => "R-{$nomor}",
            'nama_ruang' => 'Ruang ' . $this->faker->randomElement(['Kelas ' . $this->faker->numberBetween(1, 12), 'Lab Komputer', 'Lab IPA', 'Perpustakaan', 'Guru', 'TU', 'Aula']),
            'bangunan_id' => \App\Models\Bangunan::inRandomOrder()->value('id') ?? \App\Models\Bangunan::factory(),
            'lantai' => (int)substr((string)$nomor, 0, 1),
            'fungsi' => $this->faker->randomElement(['kelas', 'kelas', 'laboratorium', 'perpustakaan', 'kantor', 'aula', 'ibadah']),
            'kapasitas' => $this->faker->randomElement([20, 30, 35, 40, 100]),
            'kondisi' => $this->faker->randomElement(['baik', 'baik', 'baik', 'rusak_ringan']),
            'keterangan' => $this->faker->optional()->sentence(),
        ];
    }
}
