<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\BangunanRequest;
use App\Http\Resources\BangunanResource;
use App\Models\Bangunan;
use App\Services\BangunanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BangunanApiController extends Controller
{
    public function __construct(protected BangunanService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'unit_id', 'kondisi']);
        $perPage = (int)$request->input('per_page', 15);
        $data = $this->service->getPaginated($filters, $perPage);

        return BangunanResource::collection($data);
    }

    public function store(BangunanRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return (new BangunanResource($item->load('unit')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Bangunan $bangunan): BangunanResource
    {
        return new BangunanResource($bangunan->load(['unit'])->loadCount('ruang'));
    }

    public function update(BangunanRequest $request, Bangunan $bangunan): BangunanResource
    {
        $updated = $this->service->update($bangunan, $request->validated());

        return new BangunanResource($updated->load('unit'));
    }

    public function destroy(Bangunan $bangunan): JsonResponse
    {
        $this->service->delete($bangunan);

        return response()->json(['message' => 'Bangunan deleted successfully'], 200);
    }
}
