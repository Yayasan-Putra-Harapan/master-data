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
        $user = $request->user();
        $filters = $request->only(['search', 'bangunan_id', 'fungsi', 'kondisi', 'per_page']);

        if ($user && $user->isOperator()) {
            $filters['unit_id'] = (string) $user->unit_id;
        }

        $perPage = (int)$request->input('per_page', 10);
        $ruang = $this->service->getPaginated($filters, $perPage);

        $bangunanQuery = Bangunan::with('unit')->select('id', 'kode_bangunan', 'nama_bangunan', 'unit_id');
        if ($user && $user->isOperator()) {
            $bangunanQuery->where('unit_id', $user->unit_id);
        }
        $bangunanList = $bangunanQuery->get();

        return Inertia::render('Ruang/Index', [
            'ruang' => $ruang,
            'bangunanList' => $bangunanList,
            'filters' => $filters,
            'isOperator' => $user?->isOperator() ?? false,
        ]);
    }

    public function store(RuangRequest $request): RedirectResponse
    {
        $bangunan = Bangunan::findOrFail($request->input('bangunan_id'));
        abort_if(!$request->user()->canAccessUnit($bangunan->unit_id), 403, 'Akses ditolak. Gedung ini di luar unit wewenang Anda.');

        $this->service->create($request->validated());

        return redirect()->route('ruang.index')->with('success', 'Data ruangan berhasil ditambahkan.');
    }

    public function update(RuangRequest $request, Ruang $ruang): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($ruang->bangunan->unit_id), 403, 'Akses ditolak.');

        $targetBangunan = Bangunan::findOrFail($request->input('bangunan_id'));
        abort_if(!$request->user()->canAccessUnit($targetBangunan->unit_id), 403, 'Akses ditolak.');

        $this->service->update($ruang, $request->validated());

        return redirect()->route('ruang.index')->with('success', 'Data ruangan berhasil diperbarui.');
    }

    public function destroy(Request $request, Ruang $ruang): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($ruang->bangunan->unit_id), 403, 'Akses ditolak.');

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
