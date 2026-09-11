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
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isOperator = $user && $user->isOperator();
        $unitId = $isOperator ? $user->unit_id : null;

        $siswaQuery = Siswa::query();
        $karyawanQuery = Karyawan::query();
        $kelasQuery = Kelas::query();
        $bangunanQuery = Bangunan::query();
        $ruangQuery = Ruang::query();
        $mapelQuery = MataPelajaran::query();
        $unitsQuery = Unit::query();

        if ($isOperator && $unitId) {
            $siswaQuery->where('unit_id', $unitId);
            $karyawanQuery->where('unit_id', $unitId);
            $kelasQuery->where('unit_id', $unitId);
            $bangunanQuery->where('unit_id', $unitId);
            $ruangQuery->whereHas('bangunan', fn($q) => $q->where('unit_id', $unitId));
            $mapelQuery->where('unit_id', $unitId);
            $unitsQuery->where('id', $unitId);
        }

        $metrics = [
            'total_units' => $isOperator ? 1 : Unit::count(),
            'total_siswa' => $siswaQuery->count(),
            'total_karyawan' => $karyawanQuery->count(),
            'total_orang_tua' => OrangTua::count(),
            'total_tahun_ajaran' => TahunAjaran::count(),
            'total_kelas' => $kelasQuery->count(),
            'total_bangunan' => $bangunanQuery->count(),
            'total_ruang' => $ruangQuery->count(),
            'total_mata_pelajaran' => $mapelQuery->count(),
            'total_vendor' => Vendor::count(),
        ];

        $unitsSummary = $unitsQuery->withCount(['siswa', 'karyawan', 'kelas', 'bangunan', 'mataPelajaran'])
            ->get()
            ->map(function ($unit) {
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
            'isOperator' => $isOperator,
        ]);
    }
}
