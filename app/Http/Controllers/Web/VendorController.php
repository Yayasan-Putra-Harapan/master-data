<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\VendorRequest;
use App\Models\Vendor;
use App\Services\VendorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function __construct(protected VendorService $service) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'kategori', 'status']);
        $vendors = $this->service->getPaginated($filters, 10);

        return Inertia::render('Vendor/Index', [
            'vendors' => $vendors,
            'filters' => $filters,
        ]);
    }

    public function store(VendorRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('vendor.index')->with('success', 'Data mitra/vendor berhasil ditambahkan.');
    }

    public function update(VendorRequest $request, Vendor $vendor): RedirectResponse
    {
        $this->service->update($vendor, $request->validated());

        return redirect()->route('vendor.index')->with('success', 'Data mitra/vendor berhasil diperbarui.');
    }

    public function destroy(Vendor $vendor): RedirectResponse
    {
        $this->service->delete($vendor);

        return redirect()->route('vendor.index')->with('success', 'Data mitra/vendor berhasil dihapus.');
    }
}
