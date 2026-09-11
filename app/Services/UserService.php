<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class UserService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = User::query()->with('unit');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        return $query->orderBy('id', 'asc')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): User
    {
        $attributes = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'unit_id' => $data['role'] === 'operator' ? $data['unit_id'] : null,
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
        ];

        return User::create($attributes);
    }

    public function update(User $user, array $data): User
    {
        $attributes = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'unit_id' => $data['role'] === 'operator' ? $data['unit_id'] : null,
        ];

        if (!empty($data['password'])) {
            $attributes['password'] = Hash::make($data['password']);
        }

        $user->update($attributes);
        return $user;
    }

    public function delete(User $targetUser, User $currentUser): bool
    {
        if ($targetUser->id === $currentUser->id) {
            throw new InvalidArgumentException("Anda tidak dapat menghapus akun Anda sendiri.");
        }

        if ($targetUser->isSuperadmin()) {
            $remainingSuperadmins = User::where('role', 'superadmin')->count();
            if ($remainingSuperadmins <= 1) {
                throw new InvalidArgumentException("Tidak dapat menghapus superadmin terakhir.");
            }
        }

        return (bool) $targetUser->delete();
    }
}
