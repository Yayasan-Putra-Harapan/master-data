<?php

namespace App\Services;

use App\Models\Ruang;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RuangService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Ruang::query()->with('bangunan.unit');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kode_ruang', 'like', "%{$search}%")
                  ->orWhere('nama_ruang', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['bangunan_id'])) {
            $query->where('bangunan_id', $filters['bangunan_id']);
        }

        if (!empty($filters['fungsi'])) {
            $query->where('fungsi', $filters['fungsi']);
        }

        if (!empty($filters['kondisi'])) {
            $query->where('kondisi', $filters['kondisi']);
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Ruang
    {
        return Ruang::create($data);
    }

    public function update(Ruang $item, array $data): Ruang
    {
        $item->update($data);
        return $item;
    }

    public function delete(Ruang $item): bool
    {
        return $item->delete();
    }
}
