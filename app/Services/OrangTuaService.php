<?php

namespace App\Services;

use App\Models\OrangTua;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrangTuaService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = OrangTua::query()
            ->withCount('siswa')
            ->with([
                'user:id,orang_tua_id,username,email,is_aktif',
                'siswa' => fn ($q) => $q->select('id', 'nisn', 'nis', 'nama_lengkap', 'unit_id', 'status', 'orang_tua_id')
                    ->with('unit:id,nama_unit,jenjang'),
            ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_ayah', 'like', "%{$search}%")
                  ->orWhere('nama_ibu', 'like', "%{$search}%")
                  ->orWhere('nama_wali', 'like', "%{$search}%")
                  ->orWhere('no_kk', 'like', "%{$search}%")
                  ->orWhere('telepon', 'like', "%{$search}%");
            });
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): OrangTua
    {
        $customUsername = $data['username'] ?? null;
        $customPassword = $data['password'] ?? null;
        unset($data['username'], $data['password']);

        $orangTua = OrangTua::create($data);

        app(UserProvisioningService::class)->syncOrangTuaUser($orangTua, $customUsername, $customPassword);

        return $orangTua;
    }

    public function update(OrangTua $orangTua, array $data): OrangTua
    {
        $customUsername = $data['username'] ?? null;
        $customPassword = $data['password'] ?? null;
        unset($data['username'], $data['password']);

        $orangTua->update($data);

        app(UserProvisioningService::class)->syncOrangTuaUser($orangTua, $customUsername, $customPassword);

        return $orangTua;
    }

    public function delete(OrangTua $orangTua): bool
    {
        return $orangTua->delete();
    }
}
