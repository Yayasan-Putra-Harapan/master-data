<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasRequest;
use App\Models\Karyawan;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use App\Models\Unit;
use App\Services\KelasService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KelasController extends Controller
{
    public function __construct(protected KelasService $service) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'tahun_ajaran_id', 'tingkat']);
        $kelas = $this->service->getPaginated($filters, 10);
        $units = Unit::select('id', 'kode_unit', 'nama_unit', 'jenjang')->where('is_aktif', true)->get();
        $tahunAjaranList = TahunAjaran::select('id', 'kode', 'nama', 'is_aktif')->orderBy('id', 'desc')->get();
        $guruList = Karyawan::select('id', 'nama', 'nip', 'unit_id')->where('role', 'guru')->where('is_aktif', true)->get();

        return Inertia::render('Kelas/Index', [
            'kelas' => $kelas,
            'units' => $units,
            'tahunAjaranList' => $tahunAjaranList,
            'guruList' => $guruList,
            'filters' => $filters,
        ]);
    }

    public function store(KelasRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('kelas.index')->with('success', 'Data kelas berhasil ditambahkan.');
    }

    public function update(KelasRequest $request, Kelas $kela): RedirectResponse
    {
        $this->service->update($kela, $request->validated());

        return redirect()->route('kelas.index')->with('success', 'Data kelas berhasil diperbarui.');
    }

    public function destroy(Kelas $kela): RedirectResponse
    {
        $this->service->delete($kela);

        return redirect()->route('kelas.index')->with('success', 'Data kelas berhasil dihapus.');
    }
}
