<?php

namespace App\Services;

use App\Models\MataPelajaran;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MataPelajaranService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = MataPelajaran::query()->with('unit');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kode_mapel', 'like', "%{$search}%")
                  ->orWhere('nama_mapel', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['kelompok'])) {
            $query->where('kelompok', $filters['kelompok']);
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): MataPelajaran
    {
        return MataPelajaran::create($data);
    }

    public function update(MataPelajaran $item, array $data): MataPelajaran
    {
        $item->update($data);
        return $item;
    }

    public function delete(MataPelajaran $item): bool
    {
        return $item->delete();
    }
}
