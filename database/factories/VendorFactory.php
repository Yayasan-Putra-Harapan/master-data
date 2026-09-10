<?php

namespace Database\Factories;

use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Vendor::class;

    public function definition(): array
    {
        $kategori = $this->faker->randomElement(['sarana_prasarana', 'buku_pelajaran', 'katering', 'seragam', 'teknologi', 'kebersihan', 'lainnya']);
        $prefix = match ($kategori) {
            'sarana_prasarana' => 'CV Karya Sarana',
            'buku_pelajaran' => 'Penerbit & Percetakan',
            'katering' => 'Katering Berkah',
            'seragam' => 'Konveksi Busana',
            'teknologi' => 'PT Solusi Edukasi Digital',
            'kebersihan' => 'CV Bersih Mandiri',
            default => 'Mitra Usaha',
        };

        return [
            'kode_vendor' => 'VND-' . $this->faker->unique()->numerify('####'),
            'nama_vendor' => "{$prefix} " . $this->faker->company(),
            'kategori' => $kategori,
            'nama_kontak' => $this->faker->name(),
            'telepon' => $this->faker->numerify('08##########'),
            'email' => $this->faker->unique()->safeEmail(),
            'alamat' => $this->faker->address(),
            'status' => 'aktif',
        ];
    }
}
