<?php

namespace App\Services;

use App\Models\Siswa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SiswaService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Siswa::query()->with(['unit', 'orangTua']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhere('nis', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['angkatan'])) {
            $query->where('angkatan', $filters['angkatan']);
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Siswa
    {
        return Siswa::create($data);
    }

    public function update(Siswa $siswa, array $data): Siswa
    {
        $siswa->update($data);
        return $siswa;
    }

    public function delete(Siswa $siswa): bool
    {
        return $siswa->delete();
    }
}
