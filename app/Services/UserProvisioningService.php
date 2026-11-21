<?php

namespace App\Services;

use App\Models\Karyawan;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserProvisioningService
{
    /**
     * Find an existing user for a master entity without hijacking another entity's account.
     */
    protected function findUser(string $foreignKey, int $id, ?string $email, ?string $username): ?User
    {
        $user = User::where($foreignKey, $id)->first();

        if ($user) {
            return $user;
        }

        if ($email) {
            $user = User::where('email', $email)->first();
            if ($user && $user->{$foreignKey} === null) {
                return $user;
            }
        }

        if ($username) {
            $user = User::where('username', $username)->first();
            if ($user && $user->{$foreignKey} === null) {
                return $user;
            }
        }

        return null;
    }

    /**
     * Guarantee a username stays unique across all user accounts.
     */
    protected function uniqueUsername(string $username, ?int $ignoreUserId = null): string
    {
        $candidate = $username;
        $suffix = 1;

        while (User::where('username', $candidate)->when($ignoreUserId, fn ($q) => $q->whereKeyNot($ignoreUserId))->exists()) {
            $candidate = $username.'_'.$suffix;
            $suffix++;

            if ($suffix > 50) {
                $candidate = $username.'_'.Str::lower(Str::random(5));
                break;
            }
        }

        return $candidate;
    }

    /**
     * Guarantee an email stays unique across all user accounts.
     */
    protected function uniqueEmail(string $email, ?int $ignoreUserId = null): string
    {
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, 'putraharapan.my.id');
        $candidate = $email;
        $suffix = 1;

        while (User::where('email', $candidate)->when($ignoreUserId, fn ($q) => $q->whereKeyNot($ignoreUserId))->exists()) {
            $candidate = $local.'_'.$suffix.'@'.$domain;
            $suffix++;

            if ($suffix > 50) {
                $candidate = $local.'_'.Str::lower(Str::random(5)).'@'.$domain;
                break;
            }
        }

        return $candidate;
    }

    /**
     * Provision or sync User account for Siswa.
     */
    public function syncSiswaUser(Siswa $siswa, ?string $customUsername = null, ?string $customPassword = null): User
    {
        $username = $customUsername ?: ($siswa->custom_username ?? $siswa->nisn);
        $email = "{$siswa->nisn}@siswa.putraharapan.my.id";

        $user = $this->findUser('siswa_id', $siswa->id, $email, $username);

        // Preserve an already-assigned username and never let two accounts share one.
        $username = $this->uniqueUsername($customUsername ?: ($user?->username ?: $username), $user?->id);
        $email = $this->uniqueEmail($email, $user?->id);

        $birthPass = $siswa->tanggal_lahir ? $siswa->tanggal_lahir->format('dmY') : '12345678';
        $finalPassword = $customPassword ?: ($siswa->custom_password ?: $birthPass);

        if (! $user) {
            $user = new User();
            $user->password = Hash::make($finalPassword);
            $user->email_verified_at = now();
        } elseif ($customPassword || $siswa->custom_password) {
            $user->password = Hash::make($finalPassword);
        }

        $user->name = $siswa->nama_lengkap;
        $user->username = $username;
        $user->email = $email;
        $user->role = 'siswa';
        $user->unit_id = $siswa->unit_id;
        $user->is_aktif = $siswa->status === 'aktif';
        $user->siswa_id = $siswa->id;
        $user->save();

        return $user;
    }

    /**
     * Handle soft delete or deletion of Siswa.
     */
    public function deleteSiswaUser(Siswa $siswa): void
    {
        User::where('siswa_id', $siswa->id)->update(['is_aktif' => false]);
    }

    /**
     * Provision or sync User account for Karyawan.
     */
    public function syncKaryawanUser(Karyawan $karyawan, ?string $customUsername = null, ?string $customPassword = null): User
    {
        $username = $customUsername ?: ($karyawan->custom_username ?: ($karyawan->nip ?: ($karyawan->nuptk ?: $karyawan->nik)));
        $password = $customPassword ?: ($karyawan->custom_password ?? null);

        $user = $this->findUser('karyawan_id', $karyawan->id, $karyawan->email, $username);

        $username = $this->uniqueUsername($customUsername ?: ($user?->username ?: $username), $user?->id);
        $email = $this->uniqueEmail($karyawan->email, $user?->id);

        if (! $user) {
            $birthPass = $password ?: ($karyawan->tanggal_lahir ? $karyawan->tanggal_lahir->format('dmY') : 'karyawan123');
            $user = new User();
            $user->password = Hash::make($birthPass);
            $user->email_verified_at = now();
        } elseif ($password) {
            $user->password = Hash::make($password);
        }

        $user->name = $karyawan->nama;
        $user->username = $username;
        $user->email = $email;
        $user->role = $karyawan->role;
        $user->unit_id = $karyawan->unit_id;
        $user->is_aktif = (bool) $karyawan->is_aktif;
        $user->karyawan_id = $karyawan->id;
        $user->save();

        return $user;
    }

    /**
     * Handle soft delete or deletion of Karyawan.
     */
    public function deleteKaryawanUser(Karyawan $karyawan): void
    {
        User::where('karyawan_id', $karyawan->id)->update(['is_aktif' => false]);
    }

    /**
     * Provision or sync User account for Orang Tua.
     */
    public function syncOrangTuaUser(OrangTua $orangTua, ?string $customUsername = null, ?string $customPassword = null): ?User
    {
        $nik = $orangTua->nik_ayah ?: ($orangTua->nik_ibu ?: ($orangTua->no_kk ?: null));
        $username = $customUsername ?: ($orangTua->custom_username ?: ($nik ?: ('ortu_'.$orangTua->id)));
        $email = $orangTua->email ?: ("{$username}@putraharapan.my.id");
        $nama = $orangTua->nama_ayah ?: ($orangTua->nama_ibu ?: ($orangTua->nama_wali ?: 'Orang Tua Siswa'));
        $password = $customPassword ?: ($orangTua->custom_password ?? null);

        $user = $this->findUser('orang_tua_id', $orangTua->id, $email, $username);

        $username = $this->uniqueUsername($customUsername ?: ($user?->username ?: $username), $user?->id);
        $email = $this->uniqueEmail($email, $user?->id);

        if (! $user) {
            $user = new User();
            $user->password = Hash::make($password ?: 'ortu123');
            $user->email_verified_at = now();
        } elseif ($password) {
            $user->password = Hash::make($password);
        }

        $user->name = $nama;
        $user->username = $username;
        $user->email = $email;
        $user->role = 'orang_tua';
        $user->unit_id = null;
        $user->is_aktif = true;
        $user->orang_tua_id = $orangTua->id;
        $user->save();

        return $user;
    }

    /**
     * Handle soft delete or deletion of Orang Tua.
     */
    public function deleteOrangTuaUser(OrangTua $orangTua): void
    {
        User::where('orang_tua_id', $orangTua->id)->update(['is_aktif' => false]);
    }

    /**
     * Sync all existing Karyawan, Siswa, and OrangTua into Users table.
     */
    public function syncAllExisting(): array
    {
        $karyawanCount = 0;
        $siswaCount = 0;
        $orangTuaCount = 0;

        Karyawan::chunk(100, function ($items) use (&$karyawanCount) {
            foreach ($items as $item) {
                $this->syncKaryawanUser($item);
                $karyawanCount++;
            }
        });

        Siswa::chunk(100, function ($items) use (&$siswaCount) {
            foreach ($items as $item) {
                $this->syncSiswaUser($item);
                $siswaCount++;
            }
        });

        OrangTua::chunk(100, function ($items) use (&$orangTuaCount) {
            foreach ($items as $item) {
                $this->syncOrangTuaUser($item);
                $orangTuaCount++;
            }
        });

        return [
            'karyawan' => $karyawanCount,
            'siswa' => $siswaCount,
            'orang_tua' => $orangTuaCount,
        ];
    }
}
