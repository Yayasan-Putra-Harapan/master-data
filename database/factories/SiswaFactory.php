<?php

namespace Database\Factories;

use App\Models\Siswa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Siswa>
 */
class SiswaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Siswa::class;

    public function definition(): array
    {
        $gender = $this->faker->randomElement(['L', 'P']);
        $fakerGender = $gender === 'L' ? 'male' : 'female';
        $unit = \App\Models\Unit::inRandomOrder()->first();
        $unitId = $unit?->id ?? \App\Models\Unit::factory();
        $jenjang = $unit?->jenjang ?? 'SD';

        $yearOffset = match ($jenjang) {
            'PG' => '-4 years',
            'TK' => '-6 years',
            'SD' => '-10 years',
            'SMP' => '-14 years',
            'SMA' => '-17 years',
            'BOARDING' => '-16 years',
            default => '-10 years',
        };

        return [
            'nisn' => $this->faker->unique()->numerify('00########'),
            'nis' => $this->faker->unique()->numerify('2024####'),
            'nik' => $this->faker->unique()->numerify('3302############'),
            'nama_lengkap' => $this->faker->name($fakerGender),
            'nama_panggilan' => $this->faker->firstName($fakerGender),
            'jenis_kelamin' => $gender,
            'tempat_lahir' => $this->faker->city(),
            'tanggal_lahir' => $this->faker->dateTimeBetween("{$yearOffset} -1 year", "{$yearOffset} +1 year")->format('Y-m-d'),
            'agama' => 'Islam',
            'unit_id' => $unitId,
            'orang_tua_id' => \App\Models\OrangTua::inRandomOrder()->value('id') ?? \App\Models\OrangTua::factory(),
            'alamat' => $this->faker->address(),
            'angkatan' => $this->faker->numberBetween(2022, 2026),
            'status' => 'aktif',
        ];
    }
}
