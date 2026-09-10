<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\KaryawanRequest;
use App\Models\Karyawan;
use App\Models\Unit;
use App\Services\KaryawanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KaryawanController extends Controller
{
    public function __construct(protected KaryawanService $karyawanService) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'role', 'is_aktif']);
        $karyawan = $this->karyawanService->getPaginated($filters, 10);
        $units = Unit::select('id', 'kode_unit', 'nama_unit')->where('is_aktif', true)->get();

        return Inertia::render('Karyawan/Index', [
            'karyawan' => $karyawan,
            'units' => $units,
            'filters' => $filters,
        ]);
    }

    public function store(KaryawanRequest $request): RedirectResponse
    {
        $this->karyawanService->create($request->validated());

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil ditambahkan.');
    }

    public function update(KaryawanRequest $request, Karyawan $karyawan): RedirectResponse
    {
        $this->karyawanService->update($karyawan, $request->validated());

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil diperbarui.');
    }

    public function destroy(Karyawan $karyawan): RedirectResponse
    {
        $this->karyawanService->delete($karyawan);

        return redirect()->route('karyawan.index')->with('success', 'Data karyawan/guru berhasil dihapus.');
    }
}
