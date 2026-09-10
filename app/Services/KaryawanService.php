<?php

namespace App\Services;

use App\Models\Karyawan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class KaryawanService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Karyawan::query()->with('unit');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['is_aktif']) && $filters['is_aktif'] !== '') {
            $query->where('is_aktif', filter_var($filters['is_aktif'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Karyawan
    {
        return Karyawan::create($data);
    }

    public function update(Karyawan $karyawan, array $data): Karyawan
    {
        $karyawan->update($data);
        return $karyawan;
    }

    public function delete(Karyawan $karyawan): bool
    {
        return $karyawan->delete();
    }
}
