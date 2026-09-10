<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SiswaRequest;
use App\Http\Resources\SiswaResource;
use App\Models\Siswa;
use App\Services\SiswaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SiswaApiController extends Controller
{
    public function __construct(protected SiswaService $siswaService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'unit_id', 'status', 'angkatan']);
        $perPage = (int)$request->input('per_page', 15);
        $siswa = $this->siswaService->getPaginated($filters, $perPage);

        return SiswaResource::collection($siswa);
    }

    public function store(SiswaRequest $request): JsonResponse
    {
        $item = $this->siswaService->create($request->validated());

        return (new SiswaResource($item->load(['unit', 'orangTua'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Siswa $siswa): SiswaResource
    {
        return new SiswaResource($siswa->load(['unit', 'orangTua']));
    }

    public function update(SiswaRequest $request, Siswa $siswa): SiswaResource
    {
        $updated = $this->siswaService->update($siswa, $request->validated());

        return new SiswaResource($updated->load(['unit', 'orangTua']));
    }

    public function destroy(Siswa $siswa): JsonResponse
    {
        $this->siswaService->delete($siswa);

        return response()->json(['message' => 'Siswa deleted successfully'], 200);
    }
}
