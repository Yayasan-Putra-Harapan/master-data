<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\KaryawanRequest;
use App\Http\Resources\KaryawanResource;
use App\Models\Karyawan;
use App\Services\KaryawanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class KaryawanApiController extends Controller
{
    public function __construct(protected KaryawanService $karyawanService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'unit_id', 'role', 'is_aktif']);
        $perPage = (int)$request->input('per_page', 15);
        $karyawan = $this->karyawanService->getPaginated($filters, $perPage);

        return KaryawanResource::collection($karyawan);
    }

    public function store(KaryawanRequest $request): JsonResponse
    {
        $item = $this->karyawanService->create($request->validated());

        return (new KaryawanResource($item->load('unit')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Karyawan $karyawan): KaryawanResource
    {
        return new KaryawanResource($karyawan->load('unit'));
    }

    public function update(KaryawanRequest $request, Karyawan $karyawan): KaryawanResource
    {
        $updated = $this->karyawanService->update($karyawan, $request->validated());

        return new KaryawanResource($updated->load('unit'));
    }

    public function destroy(Karyawan $karyawan): JsonResponse
    {
        $this->karyawanService->delete($karyawan);

        return response()->json(['message' => 'Karyawan deleted successfully'], 200);
    }
}
