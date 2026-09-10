<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\MataPelajaranRequest;
use App\Http\Resources\MataPelajaranResource;
use App\Models\MataPelajaran;
use App\Services\MataPelajaranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MataPelajaranApiController extends Controller
{
    public function __construct(protected MataPelajaranService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'unit_id', 'kelompok']);
        $perPage = (int)$request->input('per_page', 15);
        $data = $this->service->getPaginated($filters, $perPage);

        return MataPelajaranResource::collection($data);
    }

    public function store(MataPelajaranRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return (new MataPelajaranResource($item->load('unit')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(MataPelajaran $mataPelajaran): MataPelajaranResource
    {
        return new MataPelajaranResource($mataPelajaran->load('unit'));
    }

    public function update(MataPelajaranRequest $request, MataPelajaran $mataPelajaran): MataPelajaranResource
    {
        $updated = $this->service->update($mataPelajaran, $request->validated());

        return new MataPelajaranResource($updated->load('unit'));
    }

    public function destroy(MataPelajaran $mataPelajaran): JsonResponse
    {
        $this->service->delete($mataPelajaran);

        return response()->json(['message' => 'Mata pelajaran deleted successfully'], 200);
    }
}
