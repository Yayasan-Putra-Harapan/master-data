<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlotSiswaRequest;
use App\Http\Requests\TransferSiswaRequest;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Services\AnggotaKelasService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class AnggotaKelasController extends Controller
{
    public function __construct(protected AnggotaKelasService $service) {}

    public function index(Request $request, Kelas $kelas): Response
    {
        $kelas->load(['unit', 'tahunAjaran', 'waliKelas']);

        $filters = $request->only(['search', 'status', 'per_page']);
        $perPage = (int)$request->input('per_page', 15);
        $anggota = $this->service->getAnggotaByKelas($kelas, $filters, $perPage);

        $availableSiswa = $this->service->getAvailableSiswaForKelas($kelas);

        $targetKelasList = Kelas::where('unit_id', $kelas->unit_id)
            ->where('tahun_ajaran_id', $kelas->tahun_ajaran_id)
            ->where('id', '!=', $kelas->id)
            ->select('id', 'kode_kelas', 'nama_kelas', 'tingkat', 'kapasitas')
            ->withCount(['anggotaKelas' => fn($q) => $q->where('status', 'aktif')])
            ->get();

        $activeCount = $kelas->anggotaKelas()->where('status', 'aktif')->count();

        return Inertia::render('Kelas/Anggota', [
            'kelas' => $kelas,
            'anggota' => $anggota,
            'availableSiswa' => $availableSiswa,
            'targetKelasList' => $targetKelasList,
            'activeCount' => $activeCount,
            'filters' => $filters,
        ]);
    }

    public function availableSiswa(Request $request, Kelas $kelas): JsonResponse
    {
        $siswa = $this->service->getAvailableSiswaForKelas($kelas, $request->only('search'));

        return response()->json([
            'data' => $siswa,
        ]);
    }

    public function store(PlotSiswaRequest $request, Kelas $kelas): RedirectResponse
    {
        try {
            $res = $this->service->plotSiswaToKelas(
                $kelas,
                $request->input('siswa_ids'),
                $request->input('tanggal_masuk'),
                $request->input('keterangan')
            );

            return redirect()->route('kelas.anggota.index', $kelas->id)
                ->with('success', "Berhasil memasukkan {$res['enrolled']} siswa ke rombel {$kelas->nama_kelas}.");
        } catch (InvalidArgumentException $e) {
            return redirect()->route('kelas.anggota.index', $kelas->id)
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(Request $request, Kelas $kelas, Siswa $siswa): RedirectResponse
    {
        $success = $this->service->removeSiswaFromKelas($kelas, $siswa->id, $request->input('keterangan'));

        if ($success) {
            return redirect()->route('kelas.anggota.index', $kelas->id)
                ->with('success', "Siswa {$siswa->nama_lengkap} berhasil dikeluarkan dari rombel.");
        }

        return redirect()->route('kelas.anggota.index', $kelas->id)
            ->with('error', "Siswa tidak ditemukan dalam anggota rombel aktif.");
    }

    public function transfer(TransferSiswaRequest $request, Kelas $kelas): RedirectResponse
    {
        $targetKelas = Kelas::findOrFail($request->input('target_kelas_id'));

        try {
            $res = $this->service->transferSiswa(
                $kelas,
                $targetKelas,
                $request->input('siswa_ids'),
                $request->input('keterangan')
            );

            return redirect()->route('kelas.anggota.index', $kelas->id)
                ->with('success', "Berhasil memindahkan {$res['transferred']} siswa ke {$res['target_kelas']}.");
        } catch (InvalidArgumentException $e) {
            return redirect()->route('kelas.anggota.index', $kelas->id)
                ->with('error', $e->getMessage());
        }
    }
}
