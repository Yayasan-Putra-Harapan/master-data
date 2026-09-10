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
        return [
            'nisn' => $this->faker->unique()->numerify('00########'),
            'nis' => $this->faker->unique()->numerify('2024####'),
            'nik' => $this->faker->unique()->numerify('3302############'),
            'nama_lengkap' => $this->faker->name($fakerGender),
            'nama_panggilan' => $this->faker->firstName($fakerGender),
            'jenis_kelamin' => $gender,
            'tempat_lahir' => $this->faker->city(),
            'tanggal_lahir' => $this->faker->dateTimeBetween('-17 years', '-4 years')->format('Y-m-d'),
            'agama' => 'Islam',
            'unit_id' => \App\Models\Unit::inRandomOrder()->value('id') ?? \App\Models\Unit::factory(),
            'orang_tua_id' => \App\Models\OrangTua::inRandomOrder()->value('id') ?? \App\Models\OrangTua::factory(),
            'alamat' => $this->faker->address(),
            'angkatan' => $this->faker->numberBetween(2022, 2026),
            'status' => 'aktif',
        ];
    }
}
