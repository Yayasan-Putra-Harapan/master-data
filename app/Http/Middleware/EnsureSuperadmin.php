<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperadmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isSuperadmin()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Akses ditolak. Tindakan ini hanya dapat diakses oleh Superadmin Yayasan.',
                ], 403);
            }

            abort(403, 'Akses ditolak. Fitur ini hanya dapat diakses oleh Superadmin Yayasan.');
        }

        return $next($request);
    }
}
