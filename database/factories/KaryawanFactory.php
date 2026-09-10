<?php

namespace Database\Factories;

use App\Models\Karyawan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Karyawan>
 */
class KaryawanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Karyawan::class;

    public function definition(): array
    {
        $gender = $this->faker->randomElement(['L', 'P']);
        $fakerGender = $gender === 'L' ? 'male' : 'female';
        return [
            'nip' => $this->faker->unique()->numerify('1985##########'),
            'nuptk' => $this->faker->unique()->numerify('################'),
            'nik' => $this->faker->unique()->numerify('3302############'),
            'nama' => $this->faker->name($fakerGender),
            'jenis_kelamin' => $gender,
            'tempat_lahir' => $this->faker->city(),
            'tanggal_lahir' => $this->faker->dateTimeBetween('-55 years', '-23 years')->format('Y-m-d'),
            'unit_id' => \App\Models\Unit::inRandomOrder()->value('id') ?? \App\Models\Unit::factory(),
            'role' => $this->faker->randomElement(['guru', 'staf', 'kepala_sekolah', 'keuangan', 'administrasi']),
            'status_kepegawaian' => $this->faker->randomElement(['tetap', 'kontrak', 'honorer']),
            'telepon' => $this->faker->numerify('08##########'),
            'email' => $this->faker->unique()->safeEmail(),
            'alamat' => $this->faker->address(),
            'pendidikan_terakhir' => $this->faker->randomElement(['S1 Pendidikan', 'S1 Komputer', 'S2 Pendidikan', 'D3 Akuntansi']),
            'tanggal_masuk' => $this->faker->dateTimeBetween('-10 years', 'now')->format('Y-m-d'),
            'is_aktif' => true,
        ];
    }
}
