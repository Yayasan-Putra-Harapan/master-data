<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\KelasRequest;
use App\Http\Resources\KelasResource;
use App\Models\Kelas;
use App\Services\KelasService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class KelasApiController extends Controller
{
    public function __construct(protected KelasService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'unit_id', 'tahun_ajaran_id', 'tingkat']);
        $perPage = (int)$request->input('per_page', 15);
        $data = $this->service->getPaginated($filters, $perPage);

        return KelasResource::collection($data);
    }

    public function store(KelasRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return (new KelasResource($item->load(['unit', 'tahunAjaran', 'waliKelas'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Kelas $kela): KelasResource
    {
        return new KelasResource($kela->load(['unit', 'tahunAjaran', 'waliKelas']));
    }

    public function update(KelasRequest $request, Kelas $kela): KelasResource
    {
        $updated = $this->service->update($kela, $request->validated());

        return new KelasResource($updated->load(['unit', 'tahunAjaran', 'waliKelas']));
    }

    public function destroy(Kelas $kela): JsonResponse
    {
        $this->service->delete($kela);

        return response()->json(['message' => 'Kelas deleted successfully'], 200);
    }
}
