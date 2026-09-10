<?php

namespace App\Services;

use App\Models\Kelas;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class KelasService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Kelas::query()->with(['unit', 'tahunAjaran', 'waliKelas']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kode_kelas', 'like', "%{$search}%")
                  ->orWhere('nama_kelas', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['tahun_ajaran_id'])) {
            $query->where('tahun_ajaran_id', $filters['tahun_ajaran_id']);
        }

        if (!empty($filters['tingkat'])) {
            $query->where('tingkat', $filters['tingkat']);
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Kelas
    {
        return Kelas::create($data);
    }

    public function update(Kelas $item, array $data): Kelas
    {
        $item->update($data);
        return $item;
    }

    public function delete(Kelas $item): bool
    {
        return $item->delete();
    }
}
