<?php

namespace Database\Factories;

use App\Models\Kelas;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kelas>
 */
class KelasFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Kelas::class;

    public function definition(): array
    {
        $unit = \App\Models\Unit::inRandomOrder()->first() ?? \App\Models\Unit::factory()->create();
        $tingkat = match ($unit->jenjang) {
            'PG', 'TK' => $this->faker->numberBetween(1, 2),
            'SD' => $this->faker->numberBetween(1, 6),
            'SMP' => $this->faker->numberBetween(7, 9),
            'SMA', 'BOARDING' => $this->faker->numberBetween(10, 12),
            default => 1,
        };
        $huruf = $this->faker->randomElement(['A', 'B', 'C']);
        return [
            'kode_kelas' => "KLS-{$unit->kode_unit}-{$tingkat}{$huruf}-" . $this->faker->unique()->numberBetween(100, 999),
            'nama_kelas' => "Kelas {$tingkat}{$huruf} " . $this->faker->randomElement(['Ibnu Sina', 'Al-Farabi', 'Al-Khawarizmi', 'Al-Kindi']),
            'tingkat' => $tingkat,
            'unit_id' => $unit->id,
            'tahun_ajaran_id' => \App\Models\TahunAjaran::inRandomOrder()->value('id') ?? \App\Models\TahunAjaran::factory(),
            'wali_kelas_id' => \App\Models\Karyawan::where('unit_id', $unit->id)->inRandomOrder()->value('id'),
            'kapasitas' => $this->faker->numberBetween(25, 35),
        ];
    }
}
