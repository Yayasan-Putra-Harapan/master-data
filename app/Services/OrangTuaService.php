<?php

namespace App\Services;

use App\Models\OrangTua;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrangTuaService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = OrangTua::query()->withCount('siswa');

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
        return OrangTua::create($data);
    }

    public function update(OrangTua $orangTua, array $data): OrangTua
    {
        $orangTua->update($data);
        return $orangTua;
    }

    public function delete(OrangTua $orangTua): bool
    {
        return $orangTua->delete();
    }
}
