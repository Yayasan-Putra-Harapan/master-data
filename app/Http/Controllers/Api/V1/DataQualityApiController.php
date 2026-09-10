<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DataQualityEvaluatorService;
use Illuminate\Http\JsonResponse;

class DataQualityApiController extends Controller
{
    public function __construct(protected DataQualityEvaluatorService $evaluator) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->evaluator->evaluateAll(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
