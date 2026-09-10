<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\BangunanRequest;
use App\Models\Bangunan;
use App\Models\Unit;
use App\Services\BangunanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BangunanController extends Controller
{
    public function __construct(protected BangunanService $service) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'kondisi']);
        $bangunan = $this->service->getPaginated($filters, 10);
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
}
