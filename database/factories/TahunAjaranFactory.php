<?php

namespace Database\Factories;

use App\Models\TahunAjaran;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TahunAjaran>
 */
class TahunAjaranFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = TahunAjaran::class;

    public function definition(): array
    {
        $year = $this->faker->numberBetween(2023, 2026);
        $nextYear = $year + 1;
        $semester = $this->faker->randomElement(['ganjil', 'genap']);
        $semUpper = strtoupper($semester);
        return [
            'kode' => "TA-{$year}/{$nextYear}-{$semUpper}-" . $this->faker->unique()->numberBetween(10, 99),
            'nama' => "Tahun Ajaran {$year}/{$nextYear} Semester " . ucfirst($semester),
            'semester' => $semester,
            'tanggal_mulai' => "{$year}-07-15",
            'tanggal_selesai' => "{$nextYear}-06-20",
            'is_aktif' => false,
        ];
    }
}
