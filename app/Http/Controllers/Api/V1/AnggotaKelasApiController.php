<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlotSiswaRequest;
use App\Http\Requests\TransferSiswaRequest;
use App\Http\Resources\AnggotaKelasResource;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Services\AnggotaKelasService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use InvalidArgumentException;

class AnggotaKelasApiController extends Controller
{
    public function __construct(protected AnggotaKelasService $service) {}

    public function index(Request $request, Kelas $kelas): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'status']);
        $perPage = (int)$request->input('per_page', 15);
        $anggota = $this->service->getAnggotaByKelas($kelas, $filters, $perPage);

        return AnggotaKelasResource::collection($anggota);
    }

    public function store(PlotSiswaRequest $request, Kelas $kelas): JsonResponse
    {
        try {
            $result = $this->service->plotSiswaToKelas(
                $kelas,
                $request->input('siswa_ids'),
                $request->input('tanggal_masuk'),
                $request->input('keterangan')
            );

            return response()->json([
                'message' => "Successfully enrolled {$result['enrolled']} students to class {$kelas->nama_kelas}.",
                'data' => $result,
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function destroy(Request $request, Kelas $kelas, Siswa $siswa): JsonResponse
    {
        $success = $this->service->removeSiswaFromKelas($kelas, $siswa->id, $request->input('keterangan'));

        if ($success) {
            return response()->json([
                'message' => "Student {$siswa->nama_lengkap} removed from class {$kelas->nama_kelas}.",
            ], 200);
        }

        return response()->json([
            'message' => "Student not found in active class enrollment.",
        ], 404);
    }

    public function transfer(TransferSiswaRequest $request, Kelas $kelas): JsonResponse
    {
        $targetKelas = Kelas::findOrFail($request->input('target_kelas_id'));

        try {
            $result = $this->service->transferSiswa(
                $kelas,
                $targetKelas,
                $request->input('siswa_ids'),
                $request->input('keterangan')
            );

            return response()->json([
                'message' => "Successfully transferred {$result['transferred']} students to {$result['target_kelas']}.",
                'data' => $result,
            ], 200);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
