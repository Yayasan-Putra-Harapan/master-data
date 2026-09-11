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
        $user = $request->user();
        $filters = $request->only(['search', 'unit_id', 'kelompok', 'per_page']);

        if ($user && $user->isOperator()) {
            $filters['unit_id'] = (string) $user->unit_id;
        }

        $perPage = (int)$request->input('per_page', 10);
        $mataPelajaran = $this->service->getPaginated($filters, $perPage);

        $unitsQuery = Unit::select('id', 'kode_unit', 'nama_unit')->where('is_aktif', true);
        if ($user && $user->isOperator()) {
            $unitsQuery->where('id', $user->unit_id);
        }
        $units = $unitsQuery->get();

        return Inertia::render('MataPelajaran/Index', [
            'mataPelajaran' => $mataPelajaran,
            'units' => $units,
            'filters' => $filters,
            'isOperator' => $user?->isOperator() ?? false,
        ]);
    }

    public function store(MataPelajaranRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->service->create($validated);

        return redirect()->route('mata-pelajaran.index')->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    public function update(MataPelajaranRequest $request, MataPelajaran $mataPelajaran): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($mataPelajaran->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $validated = $request->validated();
        if ($request->user() && $request->user()->isOperator()) {
            $validated['unit_id'] = $request->user()->unit_id;
        }

        $this->service->update($mataPelajaran, $validated);

        return redirect()->route('mata-pelajaran.index')->with('success', 'Mata pelajaran berhasil diperbarui.');
    }

    public function destroy(Request $request, MataPelajaran $mataPelajaran): RedirectResponse
    {
        abort_if(!$request->user()->canAccessUnit($mataPelajaran->unit_id), 403, 'Akses ditolak. Anda tidak memiliki wewenang pada data unit ini.');

        $this->service->delete($mataPelajaran);

        return redirect()->route('mata-pelajaran.index')->with('success', 'Mata pelajaran berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $request->all();
        if ($request->user() && $request->user()->isOperator()) {
            $filters['unit_id'] = $request->user()->unit_id;
        }

        return $this->exportService->exportMataPelajaran($filters);
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
