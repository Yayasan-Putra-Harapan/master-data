<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'action', 'subject_type', 'per_page']);
        $perPage = (int)$request->input('per_page', 25);

        $query = ActivityLog::query()->with('user');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['subject_type'])) {
            $query->where('subject_type', $filters['subject_type']);
        }

        $logs = $query->latest('id')->paginate($perPage)->withQueryString();

        $actions = ActivityLog::select('action')->distinct()->pluck('action');
        $subjectTypes = ActivityLog::whereNotNull('subject_type')->select('subject_type')->distinct()->pluck('subject_type');

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'actions' => $actions,
            'subjectTypes' => $subjectTypes,
        ]);
    }
}
