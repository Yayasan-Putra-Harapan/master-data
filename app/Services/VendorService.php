<?php

namespace App\Services;

use App\Models\Vendor;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class VendorService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Vendor::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kode_vendor', 'like', "%{$search}%")
                  ->orWhere('nama_vendor', 'like', "%{$search}%")
                  ->orWhere('nama_kontak', 'like', "%{$search}%")
                  ->orWhere('telepon', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['kategori'])) {
            $query->where('kategori', $filters['kategori']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Vendor
    {
        return Vendor::create($data);
    }

    public function update(Vendor $item, array $data): Vendor
    {
        $item->update($data);
        return $item;
    }

    public function delete(Vendor $item): bool
    {
        return $item->delete();
    }
}
