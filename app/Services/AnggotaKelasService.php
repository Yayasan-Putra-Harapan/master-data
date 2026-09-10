<?php

namespace App\Services;

use App\Models\AnggotaKelas;
use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AnggotaKelasService
{
    public function getAnggotaByKelas(Kelas $kelas, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = AnggotaKelas::query()
            ->where('kelas_id', $kelas->id)
            ->with(['siswa.orangTua', 'siswa.unit']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        } else {
            $query->where('status', 'aktif');
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('siswa', function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('id', 'asc')->paginate($perPage)->withQueryString();
    }

    public function getAvailableSiswaForKelas(Kelas $kelas, array $filters = []): Collection
    {
        $query = Siswa::query()
            ->where('unit_id', $kelas->unit_id)
            ->where('status', 'aktif')
            ->whereDoesntHave('anggotaKelas', function ($q) use ($kelas) {
                $q->where('tahun_ajaran_id', $kelas->tahun_ajaran_id)
                  ->where('status', 'aktif');
            });

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('nama_lengkap', 'asc')->limit(100)->get();
    }

    public function plotSiswaToKelas(Kelas $kelas, array $siswaIds, ?string $tanggalMasuk = null, ?string $keterangan = null): array
    {
        $currentActiveCount = AnggotaKelas::where('kelas_id', $kelas->id)
            ->where('status', 'aktif')
            ->count();

        $availableSlots = $kelas->kapasitas - $currentActiveCount;

        if (count($siswaIds) > $availableSlots) {
            throw new InvalidArgumentException(
                "Kapasitas kelas tidak mencukupi. Sisa kuota: {$availableSlots} kursi, jumlah siswa yang dipilih: " . count($siswaIds) . "."
            );
        }

        $tanggal = $tanggalMasuk ?: now()->format('Y-m-d');
        $enrolledCount = 0;

        DB::transaction(function () use ($kelas, $siswaIds, $tanggal, $keterangan, &$enrolledCount) {
            foreach ($siswaIds as $siswaId) {
                // Non-aktifkan penempatan aktif sebelumnya di tahun ajaran yang sama jika ada
                AnggotaKelas::where('siswa_id', $siswaId)
                    ->where('tahun_ajaran_id', $kelas->tahun_ajaran_id)
                    ->where('status', 'aktif')
                    ->where('kelas_id', '!=', $kelas->id)
                    ->update([
                        'status' => 'pindah',
                        'keterangan' => 'Dipindahkan ke kelas ' . $kelas->nama_kelas,
                    ]);

                AnggotaKelas::withTrashed()->updateOrCreate(
                    [
                        'siswa_id' => $siswaId,
                        'kelas_id' => $kelas->id,
                        'tahun_ajaran_id' => $kelas->tahun_ajaran_id,
                    ],
                    [
                        'tanggal_masuk' => $tanggal,
                        'status' => 'aktif',
                        'keterangan' => $keterangan,
                        'deleted_at' => null,
                    ]
                );

                $enrolledCount++;
            }
        });

        return [
            'enrolled' => $enrolledCount,
            'current_total' => $currentActiveCount + $enrolledCount,
            'kapasitas' => $kelas->kapasitas,
        ];
    }

    public function removeSiswaFromKelas(Kelas $kelas, int $siswaId, ?string $keterangan = null): bool
    {
        $enrollment = AnggotaKelas::where('kelas_id', $kelas->id)
            ->where('siswa_id', $siswaId)
            ->where('status', 'aktif')
            ->first();

        if ($enrollment) {
            $enrollment->update([
                'status' => 'keluar',
                'keterangan' => $keterangan ?: 'Dikeluarkan dari rombel',
            ]);
            $enrollment->delete();
            return true;
        }

        return false;
    }

    public function transferSiswa(Kelas $sourceKelas, Kelas $targetKelas, array $siswaIds, ?string $keterangan = null): array
    {
        if ($sourceKelas->unit_id !== $targetKelas->unit_id) {
            throw new InvalidArgumentException("Pemindahan siswa hanya dapat dilakukan antar kelas dalam unit yang sama.");
        }

        $targetCurrentActive = AnggotaKelas::where('kelas_id', $targetKelas->id)
            ->where('status', 'aktif')
            ->count();

        $targetAvailableSlots = $targetKelas->kapasitas - $targetCurrentActive;

        if (count($siswaIds) > $targetAvailableSlots) {
            throw new InvalidArgumentException(
                "Kapasitas kelas tujuan ({$targetKelas->nama_kelas}) tidak mencukupi. Sisa kuota: {$targetAvailableSlots}."
            );
        }

        $movedCount = 0;

        DB::transaction(function () use ($sourceKelas, $targetKelas, $siswaIds, $keterangan, &$movedCount) {
            foreach ($siswaIds as $siswaId) {
                // Update previous enrollment to pindah
                AnggotaKelas::where('kelas_id', $sourceKelas->id)
                    ->where('siswa_id', $siswaId)
                    ->where('status', 'aktif')
                    ->update([
                        'status' => 'pindah',
                        'keterangan' => 'Dimutasi ke ' . $targetKelas->nama_kelas,
                    ]);

                // Create or reactivate target enrollment
                AnggotaKelas::withTrashed()->updateOrCreate(
                    [
                        'siswa_id' => $siswaId,
                        'kelas_id' => $targetKelas->id,
                        'tahun_ajaran_id' => $targetKelas->tahun_ajaran_id,
                    ],
                    [
                        'tanggal_masuk' => now()->format('Y-m-d'),
                        'status' => 'aktif',
                        'keterangan' => $keterangan ?: 'Pindahan dari ' . $sourceKelas->nama_kelas,
                        'deleted_at' => null,
                    ]
                );

                $movedCount++;
            }
        });

        return [
            'transferred' => $movedCount,
            'source_kelas' => $sourceKelas->nama_kelas,
            'target_kelas' => $targetKelas->nama_kelas,
        ];
    }
}
