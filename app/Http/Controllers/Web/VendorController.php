<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\VendorRequest;
use App\Models\Vendor;
use App\Services\MasterDataExportService;
use App\Services\MasterDataImportService;
use App\Services\VendorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VendorController extends Controller
{
    public function __construct(
        protected VendorService $service,
        protected MasterDataExportService $exportService,
        protected MasterDataImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'kategori', 'status', 'per_page']);
        $perPage = (int)$request->input('per_page', 10);
        $vendors = $this->service->getPaginated($filters, $perPage);

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

    public function export(Request $request): StreamedResponse
    {
        return $this->exportService->exportVendor($request->all());
    }

    public function template(): StreamedResponse
    {
        return $this->exportService->templateVendor();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas harus berupa .csv',
        ]);

        $res = $this->importService->importVendor($request->file('file'));

        if (!$res['success']) {
            return redirect()->route('vendor.index')->with('error', $res['message']);
        }

        $msg = "Impor selesai: {$res['imported']} data mitra vendor berhasil ditambahkan.";
        if (!empty($res['errors'])) {
            $msg .= " Namun, " . count($res['errors']) . " baris dilewati karena validasi.";
        }

        return redirect()->route('vendor.index')->with('success', $msg);
    }
}
