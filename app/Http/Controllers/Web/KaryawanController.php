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
        $user = $request->user();
        $filters = $request->only(['search', 'unit_id', 'role', 'is_aktif', 'per_page']);

        if ($user && $user->isOperator()) {
            $filters['unit_id'] = (string) $user->unit_id;
        }

        $perPage = (int)$request->input('per_page', 10);
        $karyawan = $this->karyawanService->getPaginated($filters, $perPage);

        $unitsQuery = Unit::select('id', 'kode_unit', 'nama_unit')->where('is_aktif', true);
        if ($user && $user->isOperator()) {
            $unitsQuery->where('id', $user->unit_id);
        }
        $units = $unitsQuery->get();

        return Inertia::render('Karyawan/Index', [
            'karyawan' => $karyawan,
            'units' => $units,
            'filters' => $filters,
            'isOperator' => $user?->isOperator() ?? false,
        ]);
    }

    public function store(KaryawanRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->karyawanService->create($validated);

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil ditambahkan.');
    }

    public function update(KaryawanRequest $request, Karyawan $karyawan): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($karyawan->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->karyawanService->update($karyawan, $validated);

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil diperbarui.');
    }

    public function destroy(Request $request, Karyawan $karyawan): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($karyawan->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $this->karyawanService->delete($karyawan);

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $request->all();
        if ($request->user() && $request->user()->isOperator()) {
            $filters['unit_id'] = $request->user()->unit_id;
        }

        return $this->exportService->exportKaryawan($filters);
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

    public function cetak(Request $request, Karyawan $karyawan): Response
    {
        abort_if(!$request->user()->canAccessUnit($karyawan->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $karyawan->load('unit');

        return Inertia::render('Karyawan/Cetak', [
            'karyawan' => $karyawan,
        ]);
    }
}
