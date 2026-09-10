<?php

namespace Database\Factories;

use App\Models\OrangTua;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrangTua>
 */
class OrangTuaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = OrangTua::class;

    public function definition(): array
    {
        return [
            'no_kk' => $this->faker->numerify('3302############'),
            'nik_ayah' => $this->faker->numerify('3302############'),
            'nama_ayah' => $this->faker->name('male'),
            'pekerjaan_ayah' => $this->faker->randomElement(['PNS', 'Wiraswasta', 'Karyawan Swasta', 'Dokter', 'Guru', 'TNI/Polri']),
            'penghasilan_ayah' => $this->faker->randomElement(['< Rp 3.000.000', 'Rp 3.000.000 - Rp 5.000.000', 'Rp 5.000.000 - Rp 10.000.000', '> Rp 10.000.000']),
            'nik_ibu' => $this->faker->numerify('3302############'),
            'nama_ibu' => $this->faker->name('female'),
            'pekerjaan_ibu' => $this->faker->randomElement(['Ibu Rumah Tangga', 'PNS', 'Wiraswasta', 'Karyawan Swasta', 'Bidan']),
            'penghasilan_ibu' => $this->faker->randomElement(['Tidak Ada', '< Rp 3.000.000', 'Rp 3.000.000 - Rp 5.000.000', '> Rp 5.000.000']),
            'telepon' => $this->faker->numerify('08##########'),
            'email' => $this->faker->safeEmail(),
            'alamat' => $this->faker->address(),
        ];
    }
}
