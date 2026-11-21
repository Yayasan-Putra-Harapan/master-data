<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserApiController extends Controller
{
    public function __construct(protected UserService $userService) {}

    /**
     * Display a listing of the users.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'role', 'unit_id', 'is_aktif']);
        $perPage = (int) $request->input('per_page', 15);
        $users = $this->userService->getPaginated($filters, $perPage);

        return UserResource::collection($users);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): UserResource
    {
        return new UserResource($user->load(['unit', 'karyawan', 'siswa', 'orangTua']));
    }
}
