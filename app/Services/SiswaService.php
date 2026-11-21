<?php

namespace App\Services;

use App\Models\Siswa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SiswaService
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Siswa::query()->with([
            'unit',
            'orangTua',
            'user:id,siswa_id,username,email,is_aktif',
        ]);

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
        $customUsername = $data['username'] ?? null;
        $customPassword = $data['password'] ?? null;
        unset($data['username'], $data['password']);

        if (isset($data['foto']) && $data['foto'] instanceof UploadedFile) {
            $data['foto'] = $data['foto']->store('siswa', 'public');
        }

        $siswa = Siswa::create($data);

        app(UserProvisioningService::class)->syncSiswaUser($siswa, $customUsername, $customPassword);

        ActivityLogger::log('create', "Menambahkan data siswa: {$siswa->nama_lengkap} (NISN: {$siswa->nisn})", $siswa, [
            'nisn' => $siswa->nisn,
            'unit_id' => $siswa->unit_id,
        ]);

        return $siswa;
    }

    public function update(Siswa $siswa, array $data): Siswa
    {
        $customUsername = $data['username'] ?? null;
        $customPassword = $data['password'] ?? null;
        unset($data['username'], $data['password']);

        if (isset($data['foto']) && $data['foto'] instanceof UploadedFile) {
            if ($siswa->foto && Storage::disk('public')->exists($siswa->foto)) {
                Storage::disk('public')->delete($siswa->foto);
            }
            $data['foto'] = $data['foto']->store('siswa', 'public');
        } elseif (array_key_exists('foto', $data) && is_null($data['foto'])) {
            if ($siswa->foto && Storage::disk('public')->exists($siswa->foto)) {
                Storage::disk('public')->delete($siswa->foto);
            }
            $data['foto'] = null;
        }

        $siswa->update($data);

        app(UserProvisioningService::class)->syncSiswaUser($siswa, $customUsername, $customPassword);

        ActivityLogger::log('update', "Memperbarui data siswa: {$siswa->nama_lengkap} (NISN: {$siswa->nisn})", $siswa);

        return $siswa;
    }

    public function delete(Siswa $siswa): bool
    {
        if ($siswa->foto && Storage::disk('public')->exists($siswa->foto)) {
            Storage::disk('public')->delete($siswa->foto);
        }

        ActivityLogger::log('delete', "Menghapus data siswa: {$siswa->nama_lengkap} (NISN: {$siswa->nisn})", $siswa);

        return $siswa->delete();
    }
}
