<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasRequest;
use App\Models\Karyawan;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use App\Models\Unit;
use App\Services\KelasService;
use App\Services\MasterDataExportService;
use App\Services\MasterDataImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KelasController extends Controller
{
    public function __construct(
        protected KelasService $service,
        protected MasterDataExportService $exportService,
        protected MasterDataImportService $importService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'unit_id', 'tahun_ajaran_id', 'tingkat', 'per_page']);
        $perPage = (int)$request->input('per_page', 10);
        $kelas = $this->service->getPaginated($filters, $perPage);
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

    public function update(KelasRequest $request, Kelas $kelas): RedirectResponse
    {
        $this->service->update($kelas, $request->validated());

        return redirect()->route('kelas.index')->with('success', 'Data kelas berhasil diperbarui.');
    }

    public function destroy(Kelas $kelas): RedirectResponse
    {
        $this->service->delete($kelas);

        return redirect()->route('kelas.index')->with('success', 'Data kelas berhasil dihapus.');
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->exportService->exportKelas($request->all());
    }

    public function template(): StreamedResponse
    {
        return $this->exportService->templateKelas();
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Pilih berkas CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas harus berupa .csv',
        ]);

        $res = $this->importService->importKelas($request->file('file'));

        if (!$res['success']) {
            return redirect()->route('kelas.index')->with('error', $res['message']);
        }

        $msg = "Impor selesai: {$res['imported']} data rombel kelas berhasil ditambahkan.";
        if (!empty($res['errors'])) {
            $msg .= " Namun, " . count($res['errors']) . " baris dilewati karena validasi.";
        }

        return redirect()->route('kelas.index')->with('success', $msg);
    }

    public function cetak(Kelas $kelas): Response
    {
        $kelas->load([
            'unit',
            'tahunAjaran',
            'waliKelas',
            'anggotaKelas' => function ($q) {
                $q->where('status', 'aktif')->with(['siswa.orangTua']);
            }
        ]);

        return Inertia::render('Kelas/Cetak', [
            'kelas' => $kelas,
        ]);
    }
}
