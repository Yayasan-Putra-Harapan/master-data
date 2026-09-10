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
        $filters = $request->only(['search', 'unit_id', 'status', 'angkatan', 'per_page']);
        $perPage = (int)$request->input('per_page', 10);
        $siswa = $this->siswaService->getPaginated($filters, $perPage);
        $units = Unit::select('id', 'kode_unit', 'nama_unit', 'jenjang')->where('is_aktif', true)->get();
        $orangTuaList = OrangTua::select('id', 'nama_ayah', 'nama_ibu', 'nama_wali', 'telepon')->get();

        return Inertia::render('Siswa/Index', [
            'siswa' => $siswa,
            'units' => $units,
            'orangTuaList' => $orangTuaList,
            'filters' => $filters,
        ]);
    }

    public function store(SiswaRequest $request): RedirectResponse
    {
        $this->siswaService->create($request->validated());

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function update(SiswaRequest $request, Siswa $siswa): RedirectResponse
    {
        $this->siswaService->update($siswa, $request->validated());

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Siswa $siswa): RedirectResponse
    {
        $this->siswaService->delete($siswa);

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->exportService->exportSiswa($request->all());
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

    public function cetak(Siswa $siswa): Response
    {
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
