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
        $query = User::query()->with(['unit', 'karyawan', 'siswa', 'orangTua']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (isset($filters['is_aktif']) && $filters['is_aktif'] !== '') {
            $query->where('is_aktif', filter_var($filters['is_aktif'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('id', 'asc')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): User
    {
        $attributes = [
            'name' => $data['name'],
            'username' => $data['username'] ?? null,
            'email' => $data['email'],
            'role' => $data['role'],
            'unit_id' => $data['unit_id'] ?? null,
            'is_aktif' => isset($data['is_aktif']) ? (bool) $data['is_aktif'] : true,
            'karyawan_id' => $data['karyawan_id'] ?? null,
            'siswa_id' => $data['siswa_id'] ?? null,
            'orang_tua_id' => $data['orang_tua_id'] ?? null,
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
        ];

        $user = User::create($attributes);

        ActivityLogger::log('create', "Membuat akun pengguna: {$user->name} ({$user->email})", $user, [
            'role' => $user->role,
            'unit_id' => $user->unit_id,
        ]);

        return $user;
    }

    public function update(User $user, array $data): User
    {
        $attributes = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'unit_id' => $data['unit_id'] ?? null,
        ];

        if (array_key_exists('username', $data)) {
            $attributes['username'] = $data['username'];
        }

        if (array_key_exists('is_aktif', $data)) {
            $attributes['is_aktif'] = (bool) $data['is_aktif'];
        }

        if (array_key_exists('karyawan_id', $data)) {
            $attributes['karyawan_id'] = $data['karyawan_id'];
        }

        if (array_key_exists('siswa_id', $data)) {
            $attributes['siswa_id'] = $data['siswa_id'];
        }

        if (array_key_exists('orang_tua_id', $data)) {
            $attributes['orang_tua_id'] = $data['orang_tua_id'];
        }

        if (!empty($data['password'])) {
            $attributes['password'] = Hash::make($data['password']);
        }

        $user->update($attributes);

        ActivityLogger::log('update', "Memperbarui akun pengguna: {$user->name} ({$user->email})", $user);

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

        ActivityLogger::log('delete', "Menghapus akun pengguna: {$targetUser->name} ({$targetUser->email})", $targetUser);

        return (bool) $targetUser->delete();
    }
}
