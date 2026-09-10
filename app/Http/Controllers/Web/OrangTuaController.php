<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrangTuaRequest;
use App\Models\OrangTua;
use App\Services\MasterDataExportService;
use App\Services\OrangTuaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrangTuaController extends Controller
{
    public function __construct(
        protected OrangTuaService $orangTuaService,
        protected MasterDataExportService $exportService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'per_page']);
        $perPage = (int)$request->input('per_page', 10);
        $orangTua = $this->orangTuaService->getPaginated($filters, $perPage);

        return Inertia::render('OrangTua/Index', [
            'orangTua' => $orangTua,
            'filters' => $filters,
        ]);
    }

    public function store(OrangTuaRequest $request): RedirectResponse
    {
        $this->orangTuaService->create($request->validated());

        return redirect()->route('orang-tua.index')->with('success', 'Data orang tua/wali berhasil ditambahkan.');
    }

    public function update(OrangTuaRequest $request, OrangTua $orangTua): RedirectResponse
    {
        $this->orangTuaService->update($orangTua, $request->validated());

        return redirect()->route('orang-tua.index')->with('success', 'Data orang tua/wali berhasil diperbarui.');
    }

    public function destroy(OrangTua $orangTua): RedirectResponse
    {
        $this->orangTuaService->delete($orangTua);

        return redirect()->route('orang-tua.index')->with('success', 'Data orang tua/wali berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->exportService->exportOrangTua($request->all());
    }
}
