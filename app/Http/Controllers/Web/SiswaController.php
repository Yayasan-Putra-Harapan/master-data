<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\SiswaRequest;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\Unit;
use App\Services\MasterDataExportService;
use App\Services\MasterDataImportService;
use App\Services\SiswaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SiswaController extends Controller
{
    public function __construct(
        protected SiswaService $siswaService,
        protected MasterDataExportService $exportService,
        protected MasterDataImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $request->only(['search', 'unit_id', 'status', 'angkatan', 'per_page']);

        if ($user && $user->isOperator()) {
            $filters['unit_id'] = (string) $user->unit_id;
        }

        $perPage = (int)$request->input('per_page', 10);
        $siswa = $this->siswaService->getPaginated($filters, $perPage);

        $unitsQuery = Unit::select('id', 'kode_unit', 'nama_unit', 'jenjang')->where('is_aktif', true);
        if ($user && $user->isOperator()) {
            $unitsQuery->where('id', $user->unit_id);
        }
        $units = $unitsQuery->get();

        $orangTuaList = OrangTua::select('id', 'nama_ayah', 'nama_ibu', 'nama_wali', 'telepon')->get();

        return Inertia::render('Siswa/Index', [
            'siswa' => $siswa,
            'units' => $units,
            'orangTuaList' => $orangTuaList,
            'filters' => $filters,
            'isOperator' => $user?->isOperator() ?? false,
        ]);
    }

    public function store(SiswaRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->siswaService->create($validated);

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function update(SiswaRequest $request, Siswa $siswa): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($siswa->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->siswaService->update($siswa, $validated);

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Request $request, Siswa $siswa): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($siswa->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $this->siswaService->delete($siswa);

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $request->all();
        if ($request->user() && $request->user()->isOperator()) {
            $filters['unit_id'] = $request->user()->unit_id;
        }

        return $this->exportService->exportSiswa($filters);
    }

    public function template(): StreamedResponse
    {
        return $this->exportService->templateSiswa();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas harus berupa .csv',
        ]);

        $res = $this->importService->importSiswa($request->file('file'));

        if (!$res['success']) {
            return redirect()->route('siswa.index')->with('error', $res['message']);
        }

        $msg = "Impor selesai: {$res['imported']} data siswa berhasil ditambahkan.";
        if (!empty($res['errors'])) {
            $msg .= " Namun, " . count($res['errors']) . " baris dilewati karena validasi.";
        }

        return redirect()->route('siswa.index')->with('success', $msg);
    }

    public function cetak(Request $request, Siswa $siswa): Response
    {
        abort_if(!$request->user()->canAccessUnit($siswa->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $siswa->load([
            'unit',
            'orangTua',
            'anggotaKelas' => fn($q) => $q->with(['kelas', 'tahunAjaran'])->where('status', 'aktif')
        ]);

        return Inertia::render('Siswa/Cetak', [
            'siswa' => $siswa,
        ]);
    }
}
