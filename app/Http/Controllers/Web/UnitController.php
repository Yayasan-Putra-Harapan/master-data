<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\UnitRequest;
use App\Models\Unit;
use App\Services\UnitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function __construct(protected UnitService $unitService) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'jenjang', 'is_aktif']);
        $units = $this->unitService->getPaginated($filters, 10);

        return Inertia::render('Units/Index', [
            'units' => $units,
            'filters' => $filters,
        ]);
    }

    public function store(UnitRequest $request): RedirectResponse
    {
        $this->unitService->create($request->validated());

        return redirect()->route('units.index')->with('success', 'Unit pendidikan berhasil ditambahkan.');
    }

    public function update(UnitRequest $request, Unit $unit): RedirectResponse
    {
        $this->unitService->update($unit, $request->validated());

        return redirect()->route('units.index')->with('success', 'Unit pendidikan berhasil diperbarui.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        $this->unitService->delete($unit);

        return redirect()->route('units.index')->with('success', 'Unit pendidikan berhasil dihapus.');
    }
}
