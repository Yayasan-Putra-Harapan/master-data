<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\BangunanRequest;
use App\Models\Bangunan;
use App\Models\Unit;
use App\Services\BangunanService;
use App\Services\MasterDataExportService;
use App\Services\MasterDataImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BangunanController extends Controller
{
    public function __construct(
        protected BangunanService $service,
        protected MasterDataExportService $exportService,
        protected MasterDataImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'kondisi', 'per_page']);
        $perPage = (int)$request->input('per_page', 10);
        $bangunan = $this->service->getPaginated($filters, $perPage);
        $units = Unit::select('id', 'kode_unit', 'nama_unit')->where('is_aktif', true)->get();

        return Inertia::render('Bangunan/Index', [
            'bangunan' => $bangunan,
            'units' => $units,
            'filters' => $filters,
        ]);
    }

    public function store(BangunanRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('bangunan.index')->with('success', 'Data gedung/bangunan berhasil ditambahkan.');
    }

    public function update(BangunanRequest $request, Bangunan $bangunan): RedirectResponse
    {
        $this->service->update($bangunan, $request->validated());

        return redirect()->route('bangunan.index')->with('success', 'Data gedung/bangunan berhasil diperbarui.');
    }

    public function destroy(Bangunan $bangunan): RedirectResponse
    {
        $this->service->delete($bangunan);

        return redirect()->route('bangunan.index')->with('success', 'Data gedung/bangunan berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->exportService->exportBangunan($request->all());
    }

    public function template(): StreamedResponse
    {
        return $this->exportService->templateBangunan();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas harus berupa .csv',
        ]);

        $res = $this->importService->importBangunan($request->file('file'));

        if (!$res['success']) {
            return redirect()->route('bangunan.index')->with('error', $res['message']);
        }

        $msg = "Impor selesai: {$res['imported']} data bangunan berhasil ditambahkan.";
        if (!empty($res['errors'])) {
            $msg .= " Namun, " . count($res['errors']) . " baris dilewati karena validasi.";
        }

        return redirect()->route('bangunan.index')->with('success', $msg);
    }
}
