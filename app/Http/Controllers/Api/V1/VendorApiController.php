<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\VendorRequest;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use App\Services\VendorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VendorApiController extends Controller
{
    public function __construct(protected VendorService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'kategori', 'status']);
        $perPage = (int)$request->input('per_page', 15);
        $data = $this->service->getPaginated($filters, $perPage);

        return VendorResource::collection($data);
    }

    public function store(VendorRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return (new VendorResource($item))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Vendor $vendor): VendorResource
    {
        return new VendorResource($vendor);
    }

    public function update(VendorRequest $request, Vendor $vendor): VendorResource
    {
        $updated = $this->service->update($vendor, $request->validated());

        return new VendorResource($updated);
    }

    public function destroy(Vendor $vendor): JsonResponse
    {
        $this->service->delete($vendor);

        return response()->json(['message' => 'Vendor deleted successfully'], 200);
    }
}
