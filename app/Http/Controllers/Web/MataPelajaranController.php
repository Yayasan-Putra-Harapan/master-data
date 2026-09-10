<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\MataPelajaranRequest;
use App\Models\MataPelajaran;
use App\Models\Unit;
use App\Services\MataPelajaranService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MataPelajaranController extends Controller
{
    public function __construct(protected MataPelajaranService $service) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'kelompok']);
        $mataPelajaran = $this->service->getPaginated($filters, 10);
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
}
