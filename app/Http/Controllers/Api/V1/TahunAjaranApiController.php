<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TahunAjaranRequest;
use App\Http\Resources\TahunAjaranResource;
use App\Models\TahunAjaran;
use App\Services\TahunAjaranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TahunAjaranApiController extends Controller
{
    public function __construct(protected TahunAjaranService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'semester', 'is_aktif']);
        $perPage = (int)$request->input('per_page', 15);
        $data = $this->service->getPaginated($filters, $perPage);

        return TahunAjaranResource::collection($data);
    }

    public function store(TahunAjaranRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return (new TahunAjaranResource($item))
            ->response()
            ->setStatusCode(201);
    }

    public function show(TahunAjaran $tahunAjaran): TahunAjaranResource
    {
        return new TahunAjaranResource($tahunAjaran->loadCount('kelas'));
    }

    public function update(TahunAjaranRequest $request, TahunAjaran $tahunAjaran): TahunAjaranResource
    {
        $updated = $this->service->update($tahunAjaran, $request->validated());

        return new TahunAjaranResource($updated);
    }

    public function destroy(TahunAjaran $tahunAjaran): JsonResponse
    {
        $this->service->delete($tahunAjaran);

        return response()->json(['message' => 'Tahun ajaran deleted successfully'], 200);
    }
}
