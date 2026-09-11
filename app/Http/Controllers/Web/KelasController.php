<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasRequest;
use App\Models\Karyawan;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use App\Models\Unit;
use App\Services\KelasService;
use App\Services\MasterDataExportService;
use App\Services\MasterDataImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KelasController extends Controller
{
    public function __construct(
        protected KelasService $service,
        protected MasterDataExportService $exportService,
        protected MasterDataImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $request->only(['search', 'unit_id', 'tahun_ajaran_id', 'tingkat', 'per_page']);

        if ($user && $user->isOperator()) {
            $filters['unit_id'] = (string) $user->unit_id;
        }

        $perPage = (int)$request->input('per_page', 10);
        $kelas = $this->service->getPaginated($filters, $perPage);

        $unitsQuery = Unit::select('id', 'kode_unit', 'nama_unit', 'jenjang')->where('is_aktif', true);
        $guruQuery = Karyawan::select('id', 'nama', 'nip', 'unit_id')->where('role', 'guru')->where('is_aktif', true);

        if ($user && $user->isOperator()) {
            $unitsQuery->where('id', $user->unit_id);
            $guruQuery->where('unit_id', $user->unit_id);
        }

        $units = $unitsQuery->get();
        $tahunAjaranList = TahunAjaran::select('id', 'kode', 'nama', 'is_aktif')->orderBy('id', 'desc')->get();
        $guruList = $guruQuery->get();

        return Inertia::render('Kelas/Index', [
            'kelas' => $kelas,
            'units' => $units,
            'tahunAjaranList' => $tahunAjaranList,
            'guruList' => $guruList,
            'filters' => $filters,
            'isOperator' => $user?->isOperator() ?? false,
        ]);
    }

    public function store(KelasRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->service->create($validated);

        return redirect()->route('kelas.index')->with('success', 'Data kelas berhasil ditambahkan.');
    }

    public function update(KelasRequest $request, Kelas $kelas): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($kelas->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->service->update($kelas, $validated);

        return redirect()->route('kelas.index')->with('success', 'Data kelas berhasil diperbarui.');
    }

    public function destroy(Request $request, Kelas $kelas): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($kelas->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $this->service->delete($kelas);

        return redirect()->route('kelas.index')->with('success', 'Data kelas berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $request->all();
        if ($request->user() && $request->user()->isOperator()) {
            $filters['unit_id'] = $request->user()->unit_id;
        }

        return $this->exportService->exportKelas($filters);
    }

    public function template(): StreamedResponse
    {
        return $this->exportService->templateKelas();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas harus berupa .csv',
        ]);

        $res = $this->importService->importKelas($request->file('file'));

        if (!$res['success']) {
            return redirect()->route('kelas.index')->with('error', $res['message']);
        }

        $msg = "Impor selesai: {$res['imported']} data rombel kelas berhasil ditambahkan.";
        if (!empty($res['errors'])) {
            $msg .= " Namun, " . count($res['errors']) . " baris dilewati karena validasi.";
        }

        return redirect()->route('kelas.index')->with('success', $msg);
    }

    public function cetak(Request $request, Kelas $kelas): Response
    {
        abort_if(!$request->user()->canAccessUnit($kelas->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $kelas->load([
            'unit',
            'tahunAjaran',
            'waliKelas',
            'anggotaKelas' => function ($q) {
                $q->where('status', 'aktif')->with(['siswa.orangTua']);
            }
        ]);

        return Inertia::render('Kelas/Cetak', [
            'kelas' => $kelas,
        ]);
    }
}
