<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\Unit;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class UserController extends Controller
{
    public function __construct(protected UserService $userService) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role', 'unit_id']);
        $users = $this->userService->getPaginated($filters, 10);
        $units = Unit::select('id', 'kode_unit', 'nama_unit', 'jenjang')->where('is_aktif', true)->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'units' => $units,
            'filters' => $filters,
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $user = $this->userService->create($request->validated());

        return redirect()->route('users.index')
            ->with('success', "Akun pengguna '{$user->name}' berhasil dibuat.");
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $this->userService->update($user, $request->validated());

        return redirect()->route('users.index')
            ->with('success', "Akun pengguna '{$user->name}' berhasil diperbarui.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        try {
            $this->userService->delete($user, $request->user());

            return redirect()->route('users.index')
                ->with('success', "Akun pengguna '{$user->name}' berhasil dihapus.");
        } catch (InvalidArgumentException $e) {
            return redirect()->route('users.index')
                ->with('error', $e->getMessage());
        }
    }
}
