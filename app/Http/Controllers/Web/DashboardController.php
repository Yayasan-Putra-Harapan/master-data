<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\Unit;
use App\Services\DataQualityEvaluatorService;
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
        ];

        $unitsSummary = Unit::withCount(['siswa', 'karyawan'])->get()->map(function ($unit) {
            return [
                'id' => $unit->id,
                'kode_unit' => $unit->kode_unit,
                'nama_unit' => $unit->nama_unit,
                'jenjang' => $unit->jenjang,
                'siswa_count' => $unit->siswa_count,
                'karyawan_count' => $unit->karyawan_count,
            ];
        });

        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
            'unitsSummary' => $unitsSummary,
        ]);
    }
}
