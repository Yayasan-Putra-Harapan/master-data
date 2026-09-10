<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\RuangRequest;
use App\Models\Bangunan;
use App\Models\Ruang;
use App\Services\RuangService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RuangController extends Controller
{
    public function __construct(protected RuangService $service) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'bangunan_id', 'fungsi', 'kondisi']);
        $ruang = $this->service->getPaginated($filters, 10);
        $bangunanList = Bangunan::with('unit')->select('id', 'kode_bangunan', 'nama_bangunan', 'unit_id')->get();

        return Inertia::render('Ruang/Index', [
            'ruang' => $ruang,
            'bangunanList' => $bangunanList,
            'filters' => $filters,
        ]);
    }

    public function store(RuangRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('ruang.index')->with('success', 'Data ruangan berhasil ditambahkan.');
    }

    public function update(RuangRequest $request, Ruang $ruang): RedirectResponse
    {
        $this->service->update($ruang, $request->validated());

        return redirect()->route('ruang.index')->with('success', 'Data ruangan berhasil diperbarui.');
    }

    public function destroy(Ruang $ruang): RedirectResponse
    {
        $this->service->delete($ruang);

        return redirect()->route('ruang.index')->with('success', 'Data ruangan berhasil dihapus.');
    }
}
