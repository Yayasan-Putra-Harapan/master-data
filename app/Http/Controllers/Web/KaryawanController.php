<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\KaryawanRequest;
use App\Models\Karyawan;
use App\Models\Unit;
use App\Services\KaryawanService;
use App\Services\MasterDataExportService;
use App\Services\MasterDataImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KaryawanController extends Controller
{
    public function __construct(
        protected KaryawanService $karyawanService,
        protected MasterDataExportService $exportService,
        protected MasterDataImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'role', 'is_aktif', 'per_page']);
        $perPage = (int)$request->input('per_page', 10);
        $karyawan = $this->karyawanService->getPaginated($filters, $perPage);
        $units = Unit::select('id', 'kode_unit', 'nama_unit')->where('is_aktif', true)->get();

        return Inertia::render('Karyawan/Index', [
            'karyawan' => $karyawan,
            'units' => $units,
            'filters' => $filters,
        ]);
    }

    public function store(KaryawanRequest $request): RedirectResponse
    {
        $this->karyawanService->create($request->validated());

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil ditambahkan.');
    }

    public function update(KaryawanRequest $request, Karyawan $karyawan): RedirectResponse
    {
        $this->karyawanService->update($karyawan, $request->validated());

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil diperbarui.');
    }

    public function destroy(Karyawan $karyawan): RedirectResponse
    {
        $this->karyawanService->delete($karyawan);

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->exportService->exportKaryawan($request->all());
    }

    public function template(): StreamedResponse
    {
        return $this->exportService->templateKaryawan();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas harus berupa .csv',
        ]);

        $res = $this->importService->importKaryawan($request->file('file'));

        if (!$res['success']) {
            return redirect()->route('karyawan.index')->with('error', $res['message']);
        }

        $msg = "Impor selesai: {$res['imported']} data pegawai/guru berhasil ditambahkan.";
        if (!empty($res['errors'])) {
            $msg .= " Namun, " . count($res['errors']) . " baris dilewati karena validasi.";
        }

        return redirect()->route('karyawan.index')->with('success', $msg);
    }
}
