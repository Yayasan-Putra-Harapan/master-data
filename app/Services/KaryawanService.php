<?php

namespace App\Services;

use App\Models\Karyawan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class KaryawanService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Karyawan::query()->with([
            'unit',
            'user:id,karyawan_id,username,email,is_aktif',
        ]);

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
        $customUsername = $data['username'] ?? null;
        $customPassword = $data['password'] ?? null;
        unset($data['username'], $data['password']);

        if (isset($data['foto']) && $data['foto'] instanceof UploadedFile) {
            $data['foto'] = $data['foto']->store('karyawan', 'public');
        }

        $karyawan = Karyawan::create($data);

        app(UserProvisioningService::class)->syncKaryawanUser($karyawan, $customUsername, $customPassword);

        ActivityLogger::log('create', "Menambahkan pegawai/guru: {$karyawan->nama} (NIK: {$karyawan->nik})", $karyawan, [
            'role' => $karyawan->role,
            'unit_id' => $karyawan->unit_id,
        ]);

        return $karyawan;
    }

    public function update(Karyawan $karyawan, array $data): Karyawan
    {
        $customUsername = $data['username'] ?? null;
        $customPassword = $data['password'] ?? null;
        unset($data['username'], $data['password']);

        if (isset($data['foto']) && $data['foto'] instanceof UploadedFile) {
            if ($karyawan->foto && Storage::disk('public')->exists($karyawan->foto)) {
                Storage::disk('public')->delete($karyawan->foto);
            }
            $data['foto'] = $data['foto']->store('karyawan', 'public');
        } elseif (array_key_exists('foto', $data) && is_null($data['foto'])) {
            if ($karyawan->foto && Storage::disk('public')->exists($karyawan->foto)) {
                Storage::disk('public')->delete($karyawan->foto);
            }
            $data['foto'] = null;
        }

        $karyawan->update($data);

        app(UserProvisioningService::class)->syncKaryawanUser($karyawan, $customUsername, $customPassword);

        ActivityLogger::log('update', "Memperbarui data pegawai/guru: {$karyawan->nama} (NIK: {$karyawan->nik})", $karyawan);

        return $karyawan;
    }

    public function delete(Karyawan $karyawan): bool
    {
        if ($karyawan->foto && Storage::disk('public')->exists($karyawan->foto)) {
            Storage::disk('public')->delete($karyawan->foto);
        }

        ActivityLogger::log('delete', "Menghapus data pegawai/guru: {$karyawan->nama} (NIK: {$karyawan->nik})", $karyawan);

        return $karyawan->delete();
    }
}
