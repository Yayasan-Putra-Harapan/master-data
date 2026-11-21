<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureBackofficeAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, ['superadmin', 'operator'])) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akses ditolak. Web Master Data hanya dapat diakses oleh Superadmin dan Operator Unit.',
                ], 403);
            }

            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => "Akun Anda bertipe '{$user?->role}'. Web Master Data khusus untuk Administrator dan Operator. Silakan masuk melalui sistem satelit terkait (SIAKAD/LMS/Portal).",
            ]);
        }

        return $next($request);
    }
}
