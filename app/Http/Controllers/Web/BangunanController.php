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
        $user = $request->user();
        $filters = $request->only(['search', 'unit_id', 'kondisi', 'per_page']);

        if ($user && $user->isOperator()) {
            $filters['unit_id'] = (string) $user->unit_id;
        }

        $perPage = (int)$request->input('per_page', 10);
        $bangunan = $this->service->getPaginated($filters, $perPage);

        $unitsQuery = Unit::select('id', 'kode_unit', 'nama_unit')->where('is_aktif', true);
        if ($user && $user->isOperator()) {
            $unitsQuery->where('id', $user->unit_id);
        }
        $units = $unitsQuery->get();

        return Inertia::render('Bangunan/Index', [
            'bangunan' => $bangunan,
            'units' => $units,
            'filters' => $filters,
            'isOperator' => $user?->isOperator() ?? false,
        ]);
    }

    public function store(BangunanRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->service->create($validated);

        return redirect()->route('bangunan.index')->with('success', 'Data gedung/bangunan berhasil ditambahkan.');
    }

    public function update(BangunanRequest $request, Bangunan $bangunan): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($bangunan->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->service->update($bangunan, $validated);

        return redirect()->route('bangunan.index')->with('success', 'Data gedung/bangunan berhasil diperbarui.');
    }

    public function destroy(Request $request, Bangunan $bangunan): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($bangunan->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $this->service->delete($bangunan);

        return redirect()->route('bangunan.index')->with('success', 'Data gedung/bangunan berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $request->all();
        if ($request->user() && $request->user()->isOperator()) {
            $filters['unit_id'] = $request->user()->unit_id;
        }

        return $this->exportService->exportBangunan($filters);
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
