<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\RuangRequest;
use App\Models\Bangunan;
use App\Models\Ruang;
use App\Services\MasterDataExportService;
use App\Services\MasterDataImportService;
use App\Services\RuangService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RuangController extends Controller
{
    public function __construct(
        protected RuangService $service,
        protected MasterDataExportService $exportService,
        protected MasterDataImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'bangunan_id', 'fungsi', 'kondisi', 'per_page']);
        $perPage = (int)$request->input('per_page', 10);
        $ruang = $this->service->getPaginated($filters, $perPage);
        $bangunanList = Bangunan::with('unit')->select('id', 'kode_bangunan', 'nama_bangunan', 'unit_id')->get();

        return Inertia::render('Ruang/Index', [
            'ruang' => $ruang,
            'bangunanList' => $bangunanList,
            'filters' => $filters,
        ]);
    }

    public function store(RuangRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('ruang.index')->with('success', 'Data ruangan berhasil ditambahkan.');
    }

    public function update(RuangRequest $request, Ruang $ruang): RedirectResponse
    {
        $this->service->update($ruang, $request->validated());

        return redirect()->route('ruang.index')->with('success', 'Data ruangan berhasil diperbarui.');
    }

    public function destroy(Ruang $ruang): RedirectResponse
    {
        $this->service->delete($ruang);

        return redirect()->route('ruang.index')->with('success', 'Data ruangan berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->exportService->exportRuang($request->all());
    }

    public function template(): StreamedResponse
    {
        return $this->exportService->templateRuang();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas harus berupa .csv',
        ]);

        $res = $this->importService->importRuang($request->file('file'));

        if (!$res['success']) {
            return redirect()->route('ruang.index')->with('error', $res['message']);
        }

        $msg = "Impor selesai: {$res['imported']} data ruangan berhasil ditambahkan.";
        if (!empty($res['errors'])) {
            $msg .= " Namun, " . count($res['errors']) . " baris dilewati karena validasi.";
        }

        return redirect()->route('ruang.index')->with('success', $msg);
    }
}
