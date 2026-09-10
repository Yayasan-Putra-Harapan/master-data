<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrangTuaRequest;
use App\Http\Resources\OrangTuaResource;
use App\Models\OrangTua;
use App\Services\OrangTuaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrangTuaApiController extends Controller
{
    public function __construct(protected OrangTuaService $orangTuaService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search']);
        $perPage = (int)$request->input('per_page', 15);
        $orangTua = $this->orangTuaService->getPaginated($filters, $perPage);

        return OrangTuaResource::collection($orangTua);
    }

    public function store(OrangTuaRequest $request): JsonResponse
    {
        $item = $this->orangTuaService->create($request->validated());

        return (new OrangTuaResource($item))
            ->response()
            ->setStatusCode(201);
    }

    public function show(OrangTua $orangTua): OrangTuaResource
    {
        return new OrangTuaResource($orangTua->loadCount('siswa'));
    }

    public function update(OrangTuaRequest $request, OrangTua $orangTua): OrangTuaResource
    {
        $updated = $this->orangTuaService->update($orangTua, $request->validated());

        return new OrangTuaResource($updated);
    }

    public function destroy(OrangTua $orangTua): JsonResponse
    {
        $this->orangTuaService->delete($orangTua);

        return response()->json(['message' => 'Orang tua deleted successfully'], 200);
    }
}
