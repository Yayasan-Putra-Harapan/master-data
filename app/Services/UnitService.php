<?php

namespace App\Services;

use App\Models\Unit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UnitService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Unit::query()->withCount(['karyawan', 'siswa']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kode_unit', 'like', "%{$search}%")
                  ->orWhere('nama_unit', 'like', "%{$search}%")
                  ->orWhere('kepala_sekolah', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['jenjang'])) {
            $query->where('jenjang', $filters['jenjang']);
        }

        if (isset($filters['is_aktif']) && $filters['is_aktif'] !== '') {
            $query->where('is_aktif', filter_var($filters['is_aktif'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('id', 'asc')->paginate($perPage)->withQueryString();
    }

    public function getAllActive(): Collection
    {
        return Unit::where('is_aktif', true)->orderBy('id')->get();
    }

    public function create(array $data): Unit
    {
        return Unit::create($data);
    }

    public function update(Unit $unit, array $data): Unit
    {
        $unit->update($data);
        return $unit;
    }

    public function delete(Unit $unit): bool
    {
        return $unit->delete();
    }
}
