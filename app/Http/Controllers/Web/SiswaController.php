<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\SiswaRequest;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\Unit;
use App\Services\SiswaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiswaController extends Controller
{
    public function __construct(protected SiswaService $siswaService) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'status', 'angkatan']);
        $siswa = $this->siswaService->getPaginated($filters, 10);
        $units = Unit::select('id', 'kode_unit', 'nama_unit', 'jenjang')->where('is_aktif', true)->get();
        $orangTuaList = OrangTua::select('id', 'nama_ayah', 'nama_ibu', 'nama_wali', 'telepon')->get();

        return Inertia::render('Siswa/Index', [
            'siswa' => $siswa,
            'units' => $units,
            'orangTuaList' => $orangTuaList,
            'filters' => $filters,
        ]);
    }

    public function store(SiswaRequest $request): RedirectResponse
    {
        $this->siswaService->create($request->validated());

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function update(SiswaRequest $request, Siswa $siswa): RedirectResponse
    {
        $this->siswaService->update($siswa, $request->validated());

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Siswa $siswa): RedirectResponse
    {
        $this->siswaService->delete($siswa);

        return redirect()->route('siswa.index')->with('success', 'Data siswa berhasil dihapus.');
    }
}
