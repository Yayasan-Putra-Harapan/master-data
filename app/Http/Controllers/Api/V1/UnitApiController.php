<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UnitRequest;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use App\Services\UnitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UnitApiController extends Controller
{
    public function __construct(protected UnitService $unitService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'jenjang', 'is_aktif']);
        $perPage = (int)$request->input('per_page', 15);
        $units = $this->unitService->getPaginated($filters, $perPage);

        return UnitResource::collection($units);
    }

    public function store(UnitRequest $request): JsonResponse
    {
        $unit = $this->unitService->create($request->validated());

        return (new UnitResource($unit))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Unit $unit): UnitResource
    {
        return new UnitResource($unit->loadCount(['siswa', 'karyawan']));
    }

    public function update(UnitRequest $request, Unit $unit): UnitResource
    {
        $updated = $this->unitService->update($unit, $request->validated());

        return new UnitResource($updated);
    }

    public function destroy(Unit $unit): JsonResponse
    {
        $this->unitService->delete($unit);

        return response()->json(['message' => 'Unit deleted successfully'], 200);
    }
}
