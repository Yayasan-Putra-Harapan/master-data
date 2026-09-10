<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\DataQualityEvaluatorService;
use Inertia\Inertia;
use Inertia\Response;

class DataQualityAuditController extends Controller
{
    public function __construct(protected DataQualityEvaluatorService $evaluator) {}

    public function index(): Response
    {
        $evaluation = $this->evaluator->evaluateAll();

        return Inertia::render('DataQuality/Index', [
            'evaluation' => $evaluation,
        ]);
    }
}
