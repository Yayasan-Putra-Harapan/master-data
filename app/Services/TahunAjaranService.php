<?php

namespace App\Services;

use App\Models\TahunAjaran;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TahunAjaranService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = TahunAjaran::query()->withCount('kelas');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['semester'])) {
            $query->where('semester', $filters['semester']);
        }

        if (isset($filters['is_aktif']) && $filters['is_aktif'] !== '') {
            $query->where('is_aktif', filter_var($filters['is_aktif'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function getAll(): Collection
    {
        return TahunAjaran::orderBy('id', 'desc')->get();
    }

    public function create(array $data): TahunAjaran
    {
        if (!empty($data['is_aktif'])) {
            TahunAjaran::where('is_aktif', true)->update(['is_aktif' => false]);
        }
        return TahunAjaran::create($data);
    }

    public function update(TahunAjaran $item, array $data): TahunAjaran
    {
        if (!empty($data['is_aktif']) && !$item->is_aktif) {
            TahunAjaran::where('is_aktif', true)->update(['is_aktif' => false]);
        }
        $item->update($data);
        return $item;
    }

    public function delete(TahunAjaran $item): bool
    {
        return $item->delete();
    }
}
