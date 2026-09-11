<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiTokenController extends Controller
{
    public function index(Request $request): Response
    {
        $tokens = $request->user()->tokens()
            ->select('id', 'name', 'last_used_at', 'created_at')
            ->orderByDesc('id')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'last_used_at' => $t->last_used_at ? $t->last_used_at->diffForHumans() : null,
                    'created_at' => $t->created_at ? $t->created_at->format('d M Y, H:i') : null,
                ];
            });

        return Inertia::render('ApiTokens/Index', [
            'tokens' => $tokens,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ], [
            'name.required' => 'Nama token atau keterangan rekan wajib diisi.',
            'name.max' => 'Nama token maksimal 100 karakter.',
        ]);

        $token = $request->user()->createToken($request->input('name'));

        return redirect()->route('api-tokens.index')
            ->with('plainTextToken', $token->plainTextToken)
            ->with('success', "API Token '{$token->accessToken->name}' berhasil diterbitkan.");
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $deleted = $request->user()->tokens()->where('id', $id)->delete();

        if ($deleted) {
            return redirect()->route('api-tokens.index')
                ->with('success', 'Akses API Token berhasil dicabut secara permanen.');
        }

        return redirect()->route('api-tokens.index')
            ->with('error', 'Token tidak ditemukan atau telah dicabut sebelumnya.');
    }
}
