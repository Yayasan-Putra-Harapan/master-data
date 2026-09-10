<?php

namespace App\Services;

use App\Models\Bangunan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BangunanService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Bangunan::query()->with('unit')->withCount('ruang');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kode_bangunan', 'like', "%{$search}%")
                  ->orWhere('nama_bangunan', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['kondisi'])) {
            $query->where('kondisi', $filters['kondisi']);
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Bangunan
    {
        return Bangunan::create($data);
    }

    public function update(Bangunan $item, array $data): Bangunan
    {
        $item->update($data);
        return $item;
    }

    public function delete(Bangunan $item): bool
    {
        return $item->delete();
    }
}
