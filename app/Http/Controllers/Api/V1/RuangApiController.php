<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RuangRequest;
use App\Http\Resources\RuangResource;
use App\Models\Ruang;
use App\Services\RuangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RuangApiController extends Controller
{
    public function __construct(protected RuangService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'bangunan_id', 'fungsi', 'kondisi']);
        $perPage = (int)$request->input('per_page', 15);
        $data = $this->service->getPaginated($filters, $perPage);

        return RuangResource::collection($data);
    }

    public function store(RuangRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return (new RuangResource($item->load('bangunan.unit')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Ruang $ruang): RuangResource
    {
        return new RuangResource($ruang->load('bangunan.unit'));
    }

    public function update(RuangRequest $request, Ruang $ruang): RuangResource
    {
        $updated = $this->service->update($ruang, $request->validated());

        return new RuangResource($updated->load('bangunan.unit'));
    }

    public function destroy(Ruang $ruang): JsonResponse
    {
        $this->service->delete($ruang);

        return response()->json(['message' => 'Ruang deleted successfully'], 200);
    }
}
