<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthApiController extends Controller
{
    /**
     * Authenticate user credentials and return an API bearer token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ], [
            'login.required' => 'Email atau username wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        $login = $validated['login'];
        $user = User::query()
            ->where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kredensial yang diberikan tidak cocok dengan data kami.',
            ], 401);
        }

        if (! $user->is_aktif) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun pengguna ini berstatus non-aktif. Silakan hubungi administrator.',
            ], 403);
        }

        $deviceName = $validated['device_name'] ?? 'external_client';
        $token = $user->createToken($deviceName);

        ActivityLogger::log('login', "Login API berhasil untuk pengguna: {$user->name} ({$user->email})", $user);

        return response()->json([
            'status' => 'success',
            'message' => 'Autentikasi berhasil.',
            'data' => [
                'token' => $token->plainTextToken,
                'token_type' => 'Bearer',
                'user' => new UserResource($user->load(['unit', 'karyawan', 'siswa', 'orangTua'])),
            ],
        ], 200);
    }

    /**
     * Get the authenticated user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new UserResource($request->user()->load(['unit', 'karyawan', 'siswa', 'orangTua'])),
        ]);
    }

    /**
     * Log the user out and revoke the current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()?->delete();

        ActivityLogger::log('logout', "Logout API untuk pengguna: {$user->name} ({$user->email})", $user);

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil logout dan token akses telah dicabut.',
        ]);
    }
}
