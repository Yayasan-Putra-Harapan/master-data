<?php

namespace Database\Factories;

use App\Models\MataPelajaran;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MataPelajaran>
 */
class MataPelajaranFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = MataPelajaran::class;

    public function definition(): array
    {
        $mapel = $this->faker->randomElement([
            ['kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam'],
            ['kode' => 'PKN', 'nama' => 'Pendidikan Pancasila & Kewarganegaraan'],
            ['kode' => 'BIN', 'nama' => 'Bahasa Indonesia'],
            ['kode' => 'BIG', 'nama' => 'Bahasa Inggris'],
            ['kode' => 'MAT', 'nama' => 'Matematika'],
            ['kode' => 'IPA', 'nama' => 'Ilmu Pengetahuan Alam'],
            ['kode' => 'IPS', 'nama' => 'Ilmu Pengetahuan Sosial'],
            ['kode' => 'SBK', 'nama' => 'Seni Budaya & Keterampilan'],
            ['kode' => 'PJK', 'nama' => 'Pendidikan Jasmani & Kesehatan'],
            ['kode' => 'INF', 'nama' => 'Informatika'],
            ['kode' => 'ARF', 'nama' => 'Bahasa Arab'],
            ['kode' => 'THZ', 'nama' => 'Tahfidz Al-Qur\'an'],
        ]);
        $unit = \App\Models\Unit::inRandomOrder()->first() ?? \App\Models\Unit::factory()->create();

        return [
            'kode_mapel' => "{$mapel['kode']}-{$unit->kode_unit}-" . $this->faker->unique()->numberBetween(10, 99),
            'nama_mapel' => $mapel['nama'],
            'unit_id' => $unit->id,
            'kelompok' => $this->faker->randomElement(['wajib', 'wajib', 'peminatan', 'muatan_lokal']),
            'beban_jam' => $this->faker->randomElement([2, 3, 4]),
            'keterangan' => 'Kurikulum Merdeka',
        ];
    }
}
