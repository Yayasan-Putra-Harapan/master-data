<?php

namespace Database\Seeders;

use App\Models\Karyawan;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Admin User
        User::firstOrCreate(
            ['email' => 'admin@yayasan.ac.id'],
            [
                'name' => 'Administrator Yayasan',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Unit Pendidikan Putra Harapan
        $unitsData = [
            [
                'kode_unit' => 'PG',
                'nama_unit' => 'Playgroup Putra Harapan',
                'jenjang' => 'PG',
                'alamat' => 'Jl. Kompol Sumarto No. 100, Purwokerto',
                'telepon' => '0281-635111',
                'email' => 'pg@putraharapan.sch.id',
                'kepala_sekolah' => 'Siti Nurhaliza, S.Pd.',
                'is_aktif' => true,
            ],
            [
                'kode_unit' => 'TK',
                'nama_unit' => 'TK Putra Harapan',
                'jenjang' => 'TK',
                'alamat' => 'Jl. Kompol Sumarto No. 100, Purwokerto',
                'telepon' => '0281-635112',
                'email' => 'tk@putraharapan.sch.id',
                'kepala_sekolah' => 'Rina Wijayanti, S.Pd.AUD.',
                'is_aktif' => true,
            ],
            [
                'kode_unit' => 'SD',
                'nama_unit' => 'SD Putra Harapan',
                'jenjang' => 'SD',
                'alamat' => 'Jl. Kompol Sumarto No. 102, Purwokerto',
                'telepon' => '0281-635113',
                'email' => 'sd@putraharapan.sch.id',
                'kepala_sekolah' => 'Bambang Santoso, M.Pd.',
                'is_aktif' => true,
            ],
            [
                'kode_unit' => 'SMP',
                'nama_unit' => 'SMP Putra Harapan',
                'jenjang' => 'SMP',
                'alamat' => 'Jl. Dr. Soeparno No. 45, Purwokerto',
                'telepon' => '0281-635114',
                'email' => 'smp@putraharapan.sch.id',
                'kepala_sekolah' => 'Drs. Hendro Wibowo, M.M.',
                'is_aktif' => true,
            ],
            [
                'kode_unit' => 'SMA',
                'nama_unit' => 'SMA Putra Harapan',
                'jenjang' => 'SMA',
                'alamat' => 'Jl. Dr. Soeparno No. 47, Purwokerto',
                'telepon' => '0281-635115',
                'email' => 'sma@putraharapan.sch.id',
                'kepala_sekolah' => 'Dr. Tri Wulandari, M.Pd.',
                'is_aktif' => true,
            ],
            [
                'kode_unit' => 'BOARDING',
                'nama_unit' => 'Boarding School Putra Harapan',
                'jenjang' => 'BOARDING',
                'alamat' => 'Jl. Raya Baturraden KM 7, Purwokerto',
                'telepon' => '0281-635116',
                'email' => 'boarding@putraharapan.sch.id',
                'kepala_sekolah' => 'Ustadz Ahmad Fauzi, Lc., M.A.',
                'is_aktif' => true,
            ],
        ];

        foreach ($unitsData as $data) {
            Unit::firstOrCreate(['kode_unit' => $data['kode_unit']], $data);
        }

        // 3. Orang Tua
        $orangTuaList = OrangTua::factory()->count(25)->create();

        // 4. Karyawan (Guru dan Staf)
        $units = Unit::all();
        foreach ($units as $unit) {
            Karyawan::factory()->count(3)->create([
                'unit_id' => $unit->id,
            ]);
        }

        // 5. Siswa
        foreach ($units as $unit) {
            Siswa::factory()->count(10)->create([
                'unit_id' => $unit->id,
                'orang_tua_id' => $orangTuaList->random()->id,
            ]);
        }
    }
}
