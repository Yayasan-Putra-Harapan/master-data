<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Bangunan;
use App\Models\Karyawan;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\OrangTua;
use App\Models\Ruang;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\Unit;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $metrics = [
            'total_units' => Unit::count(),
            'total_siswa' => Siswa::count(),
            'total_karyawan' => Karyawan::count(),
            'total_orang_tua' => OrangTua::count(),
            'total_tahun_ajaran' => TahunAjaran::count(),
            'total_kelas' => Kelas::count(),
            'total_bangunan' => Bangunan::count(),
            'total_ruang' => Ruang::count(),
            'total_mata_pelajaran' => MataPelajaran::count(),
            'total_vendor' => Vendor::count(),
        ];

        $unitsSummary = Unit::withCount(['siswa', 'karyawan', 'kelas', 'bangunan', 'mataPelajaran'])->get()->map(function ($unit) {
            return [
                'id' => $unit->id,
                'kode_unit' => $unit->kode_unit,
                'nama_unit' => $unit->nama_unit,
                'jenjang' => $unit->jenjang,
                'siswa_count' => $unit->siswa_count,
                'karyawan_count' => $unit->karyawan_count,
                'kelas_count' => $unit->kelas_count,
                'bangunan_count' => $unit->bangunan_count,
                'mapel_count' => $unit->mata_pelajaran_count,
            ];
        });

        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'unitsSummary' => $unitsSummary,
        ]);
    }
}
