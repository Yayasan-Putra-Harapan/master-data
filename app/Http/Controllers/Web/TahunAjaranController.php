<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\TahunAjaranRequest;
use App\Models\TahunAjaran;
use App\Services\TahunAjaranService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TahunAjaranController extends Controller
{
    public function __construct(protected TahunAjaranService $service) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'semester', 'is_aktif']);
        $tahunAjaran = $this->service->getPaginated($filters, 10);

        return Inertia::render('TahunAjaran/Index', [
            'tahunAjaran' => $tahunAjaran,
            'filters' => $filters,
        ]);
    }

    public function store(TahunAjaranRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('tahun-ajaran.index')->with('success', 'Tahun ajaran berhasil ditambahkan.');
    }

    public function update(TahunAjaranRequest $request, TahunAjaran $tahunAjaran): RedirectResponse
    {
        $this->service->update($tahunAjaran, $request->validated());

        return redirect()->route('tahun-ajaran.index')->with('success', 'Tahun ajaran berhasil diperbarui.');
    }

    public function destroy(TahunAjaran $tahunAjaran): RedirectResponse
    {
        $this->service->delete($tahunAjaran);

        return redirect()->route('tahun-ajaran.index')->with('success', 'Tahun ajaran berhasil dihapus.');
    }
}
