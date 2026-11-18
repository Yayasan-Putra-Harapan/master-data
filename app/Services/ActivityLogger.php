<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    public static function log(
        string $action,
        string $description,
        ?Model $subject = null,
        ?array $properties = null
    ): ActivityLog {
        $user = Auth::user();

        return ActivityLog::create([
            'user_id' => $user?->id,
            'user_name' => $user ? $user->name . ' (' . ($user->isSuperadmin() ? 'Superadmin' : 'Operator ' . ($user->unit?->kode_unit ?? '')) . ')' : 'Sistem',
            'action' => strtolower($action),
            'subject_type' => $subject ? class_basename($subject) : null,
            'subject_id' => $subject?->getKey(),
            'description' => $description,
            'properties' => $properties,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
