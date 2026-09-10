<?php

namespace Database\Seeders;

use App\Models\Bangunan;
use App\Models\Karyawan;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Ruang;
use App\Models\TahunAjaran;
use App\Models\Unit;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class IncrementTwoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tahun Ajaran
        $taList = [
            [
                'kode' => 'TA-2024/2025-GANJIL',
                'nama' => 'Tahun Ajaran 2024/2025 Semester Ganjil',
                'semester' => 'ganjil',
                'tanggal_mulai' => '2024-07-15',
                'tanggal_selesai' => '2024-12-20',
                'is_aktif' => false,
            ],
            [
                'kode' => 'TA-2024/2025-GENAP',
                'nama' => 'Tahun Ajaran 2024/2025 Semester Genap',
                'semester' => 'genap',
                'tanggal_mulai' => '2025-01-06',
                'tanggal_selesai' => '2025-06-20',
                'is_aktif' => false,
            ],
            [
                'kode' => 'TA-2025/2026-GANJIL',
                'nama' => 'Tahun Ajaran 2025/2026 Semester Ganjil',
                'semester' => 'ganjil',
                'tanggal_mulai' => '2025-07-14',
                'tanggal_selesai' => '2025-12-19',
                'is_aktif' => true,
            ],
            [
                'kode' => 'TA-2025/2026-GENAP',
                'nama' => 'Tahun Ajaran 2025/2026 Semester Genap',
                'semester' => 'genap',
                'tanggal_mulai' => '2026-01-05',
                'tanggal_selesai' => '2026-06-19',
                'is_aktif' => false,
            ],
        ];

        foreach ($taList as $ta) {
            TahunAjaran::firstOrCreate(['kode' => $ta['kode']], $ta);
        }

        $activeTA = TahunAjaran::where('is_aktif', true)->first() ?? TahunAjaran::first();

        // 2. Bangunan & Fasilitas
        $units = Unit::all();
        $bangunanConfigs = [
            'PG' => [
                ['kode' => 'GDG-PG', 'nama' => 'Gedung Ceria Playgroup', 'lantai' => 1, 'luas' => 300],
            ],
            'TK' => [
                ['kode' => 'GDG-TK', 'nama' => 'Gedung Pelangi TK', 'lantai' => 2, 'luas' => 450],
            ],
            'SD' => [
                ['kode' => 'GDG-SD-A', 'nama' => 'Gedung Utama SD (Aisyah)', 'lantai' => 3, 'luas' => 1200],
                ['kode' => 'GDG-SD-B', 'nama' => 'Gedung Penunjang SD (Ali bin Abi Thalib)', 'lantai' => 2, 'luas' => 800],
            ],
            'SMP' => [
                ['kode' => 'GDG-SMP', 'nama' => 'Gedung Terpadu SMP (Umar bin Khattab)', 'lantai' => 3, 'luas' => 1400],
            ],
            'SMA' => [
                ['kode' => 'GDG-SMA', 'nama' => 'Gedung Sains & Humaniora SMA', 'lantai' => 4, 'luas' => 1800],
            ],
            'BOARDING' => [
                ['kode' => 'GDG-ASR-PA', 'nama' => 'Kompleks Asrama Putra (Thoriq bin Ziyad)', 'lantai' => 3, 'luas' => 1500],
                ['kode' => 'GDG-ASR-PI', 'nama' => 'Kompleks Asrama Putri (Khadijah)', 'lantai' => 3, 'luas' => 1500],
            ],
        ];

        foreach ($units as $unit) {
            $configs = $bangunanConfigs[$unit->jenjang] ?? [];
            foreach ($configs as $cfg) {
                $b = Bangunan::firstOrCreate(
                    ['kode_bangunan' => $cfg['kode']],
                    [
                        'nama_bangunan' => $cfg['nama'],
                        'unit_id' => $unit->id,
                        'jumlah_lantai' => $cfg['lantai'],
                        'luas' => $cfg['luas'],
                        'kondisi' => 'baik',
                        'keterangan' => 'Gedung operasional aktif',
                    ]
                );

                // 3. Ruang per Bangunan
                for ($lt = 1; $lt <= $cfg['lantai']; $lt++) {
                    Ruang::firstOrCreate(
                        ['kode_ruang' => "R-{$unit->kode_unit}-{$lt}01"],
                        [
                            'nama_ruang' => "Ruang Kelas {$unit->kode_unit} {$lt}.1",
                            'bangunan_id' => $b->id,
                            'lantai' => $lt,
                            'fungsi' => 'kelas',
                            'kapasitas' => 30,
                            'kondisi' => 'baik',
                        ]
                    );
                    Ruang::firstOrCreate(
                        ['kode_ruang' => "R-{$unit->kode_unit}-{$lt}02"],
                        [
                            'nama_ruang' => "Ruang Laboratorium / Praktik {$unit->kode_unit} {$lt}.2",
                            'bangunan_id' => $b->id,
                            'lantai' => $lt,
                            'fungsi' => 'laboratorium',
                            'kapasitas' => 35,
                            'kondisi' => 'baik',
                        ]
                    );
                }
            }
        }

        // 4. Kelas per Unit
        foreach ($units as $unit) {
            $guruList = Karyawan::where('unit_id', $unit->id)->where('role', 'guru')->get();
            $tingkatOptions = match ($unit->jenjang) {
                'PG' => [1],
                'TK' => [1, 2],
                'SD' => [1, 2, 3, 4, 5, 6],
                'SMP' => [7, 8, 9],
                'SMA', 'BOARDING' => [10, 11, 12],
                default => [1],
            };

            foreach ($tingkatOptions as $tingkat) {
                foreach (['A', 'B'] as $paralel) {
                    $wali = $guruList->isNotEmpty() ? $guruList->random()->id : null;
                    Kelas::firstOrCreate(
                        ['kode_kelas' => "KLS-{$unit->kode_unit}-{$tingkat}{$paralel}"],
                        [
                            'nama_kelas' => "Kelas {$tingkat}{$paralel} - {$unit->nama_unit}",
                            'tingkat' => $tingkat,
                            'unit_id' => $unit->id,
                            'tahun_ajaran_id' => $activeTA->id,
                            'wali_kelas_id' => $wali,
                            'kapasitas' => 30,
                        ]
                    );
                }
            }
        }

        // 5. Mata Pelajaran
        $commonMapel = [
            ['kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'kelompok' => 'wajib', 'jam' => 3],
            ['kode' => 'PKN', 'nama' => 'Pendidikan Pancasila & Kewarganegaraan', 'kelompok' => 'wajib', 'jam' => 2],
            ['kode' => 'BIN', 'nama' => 'Bahasa Indonesia', 'kelompok' => 'wajib', 'jam' => 4],
            ['kode' => 'BIG', 'nama' => 'Bahasa Inggris', 'kelompok' => 'wajib', 'jam' => 3],
            ['kode' => 'MAT', 'nama' => 'Matematika', 'kelompok' => 'wajib', 'jam' => 4],
            ['kode' => 'PJK', 'nama' => 'Pendidikan Jasmani & Kesehatan', 'kelompok' => 'wajib', 'jam' => 2],
            ['kode' => 'ARF', 'nama' => 'Bahasa Arab & Keislaman', 'kelompok' => 'muatan_lokal', 'jam' => 2],
            ['kode' => 'THZ', 'nama' => 'Tahfidz Al-Qur\'an', 'kelompok' => 'muatan_lokal', 'jam' => 3],
        ];

        foreach ($units as $unit) {
            foreach ($commonMapel as $m) {
                MataPelajaran::firstOrCreate(
                    ['kode_mapel' => "{$m['kode']}-{$unit->kode_unit}"],
                    [
                        'nama_mapel' => $m['nama'],
                        'unit_id' => $unit->id,
                        'kelompok' => $m['kelompok'],
                        'beban_jam' => $m['jam'],
                        'keterangan' => 'Kurikulum Merdeka Putra Harapan',
                    ]
                );
            }
        }

        // 6. Vendor
        $vendors = [
            [
                'kode_vendor' => 'VND-001',
                'nama_vendor' => 'PT Erlangga Mahameru Pratama',
                'kategori' => 'buku_pelajaran',
                'nama_kontak' => 'Hendra Setiawan',
                'telepon' => '0281-641122',
                'email' => 'sales.pwt@erlangga.co.id',
                'alamat' => 'Jl. Jenderal Soedirman No. 120, Purwokerto',
                'status' => 'aktif',
            ],
            [
                'kode_vendor' => 'VND-002',
                'nama_vendor' => 'CV Harapan Media Edukasi',
                'kategori' => 'sarana_prasarana',
                'nama_kontak' => 'Bambang Irawan',
                'telepon' => '08122334455',
                'email' => 'contact@harapanmedia.com',
                'alamat' => 'Jl. Gerilya Timur No. 45, Purwokerto Selatan',
                'status' => 'aktif',
            ],
            [
                'kode_vendor' => 'VND-003',
                'nama_vendor' => 'Katering Barokah Putra Harapan',
                'kategori' => 'katering',
                'nama_kontak' => 'Hj. Siti Aminah',
                'telepon' => '085711223344',
                'email' => 'barokahkatering@gmail.com',
                'alamat' => 'Jl. Dr. Angka No. 88, Purwokerto',
                'status' => 'aktif',
            ],
            [
                'kode_vendor' => 'VND-004',
                'nama_vendor' => 'CV Karya Cipta Busana Sekolah',
                'kategori' => 'seragam',
                'nama_kontak' => 'Agus Santoso',
                'telepon' => '081399887766',
                'email' => 'seragampwt@karyacipta.com',
                'alamat' => 'Jl. Supriyadi No. 12, Purwokerto',
                'status' => 'aktif',
            ],
            [
                'kode_vendor' => 'VND-005',
                'nama_vendor' => 'PT Solusi Teknologi Nusantara (EduTech)',
                'kategori' => 'teknologi',
                'nama_kontak' => 'Faisal Rahman, S.Kom.',
                'telepon' => '021-55667788',
                'email' => 'enterprise@edutech.id',
                'alamat' => 'Cyber Building Lt. 4, Jakarta Selatan',
                'status' => 'aktif',
            ],
        ];

        foreach ($vendors as $v) {
            Vendor::firstOrCreate(['kode_vendor' => $v['kode_vendor']], $v);
        }
    }
}
