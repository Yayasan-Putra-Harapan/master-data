<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\MataPelajaranRequest;
use App\Models\MataPelajaran;
use App\Models\Unit;
use App\Services\MasterDataExportService;
use App\Services\MasterDataImportService;
use App\Services\MataPelajaranService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MataPelajaranController extends Controller
{
    public function __construct(
        protected MataPelajaranService $service,
        protected MasterDataExportService $exportService,
        protected MasterDataImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'kelompok', 'per_page']);
        $perPage = (int)$request->input('per_page', 10);
        $mataPelajaran = $this->service->getPaginated($filters, $perPage);
        $units = Unit::select('id', 'kode_unit', 'nama_unit')->where('is_aktif', true)->get();

        return Inertia::render('MataPelajaran/Index', [
            'mataPelajaran' => $mataPelajaran,
            'units' => $units,
            'filters' => $filters,
        ]);
    }

    public function store(MataPelajaranRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('mata-pelajaran.index')->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    public function update(MataPelajaranRequest $request, MataPelajaran $mataPelajaran): RedirectResponse
    {
        $this->service->update($mataPelajaran, $request->validated());

        return redirect()->route('mata-pelajaran.index')->with('success', 'Mata pelajaran berhasil diperbarui.');
    }

    public function destroy(MataPelajaran $mataPelajaran): RedirectResponse
    {
        $this->service->delete($mataPelajaran);

        return redirect()->route('mata-pelajaran.index')->with('success', 'Mata pelajaran berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->exportService->exportMataPelajaran($request->all());
    }

    public function template(): StreamedResponse
    {
        return $this->exportService->templateMataPelajaran();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas harus berupa .csv',
        ]);

        $res = $this->importService->importMataPelajaran($request->file('file'));

        if (!$res['success']) {
            return redirect()->route('mata-pelajaran.index')->with('error', $res['message']);
        }

        $msg = "Impor selesai: {$res['imported']} mata pelajaran berhasil ditambahkan.";
        if (!empty($res['errors'])) {
            $msg .= " Namun, " . count($res['errors']) . " baris dilewati karena validasi.";
        }

        return redirect()->route('mata-pelajaran.index')->with('success', $msg);
    }
}
