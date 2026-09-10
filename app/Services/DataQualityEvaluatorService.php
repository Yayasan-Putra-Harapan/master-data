<?php

namespace App\Services;

use App\Models\Karyawan;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DataQualityEvaluatorService
{
    /**
     * Evaluasi 5 Dimensi Kualitas Data (Schmuck 2024 / Prasetyo et al. 2025)
     */
    public function evaluateAll(): array
    {
        return [
            'completeness' => $this->evaluateCompleteness(),
            'uniqueness' => $this->evaluateUniqueness(),
            'consistency' => $this->evaluateConsistency(),
            'validity' => $this->evaluateValidity(),
            'accuracy' => $this->evaluateAccuracy(),
            'summary' => $this->calculateOverallScore(),
        ];
    }

    public function evaluateCompleteness(): array
    {
        // Siswa required fields completeness
        $totalSiswa = Siswa::count();
        if ($totalSiswa === 0) return ['score' => 100, 'details' => 'No data'];

        $siswaComplete = Siswa::whereNotNull('nisn')
            ->whereNotNull('nama_lengkap')
            ->whereNotNull('jenis_kelamin')
            ->whereNotNull('tempat_lahir')
            ->whereNotNull('tanggal_lahir')
            ->whereNotNull('unit_id')
            ->whereNotNull('alamat')
            ->whereNotNull('angkatan')
            ->count();

        // Karyawan completeness
        $totalKaryawan = Karyawan::count();
        $karyawanComplete = $totalKaryawan > 0 ? Karyawan::whereNotNull('nik')
            ->whereNotNull('nama')
            ->whereNotNull('jenis_kelamin')
            ->whereNotNull('tanggal_lahir')
            ->whereNotNull('unit_id')
            ->whereNotNull('role')
            ->whereNotNull('telepon')
            ->whereNotNull('email')
            ->count() : 0;

        $totalChecked = $totalSiswa + $totalKaryawan;
        $totalPassed = $siswaComplete + $karyawanComplete;
        $score = $totalChecked > 0 ? round(($totalPassed / $totalChecked) * 100, 2) : 100;

        return [
            'score' => $score,
            'total_records' => $totalChecked,
            'complete_records' => $totalPassed,
            'siswa_percentage' => round(($siswaComplete / $totalSiswa) * 100, 2),
            'karyawan_percentage' => $totalKaryawan > 0 ? round(($karyawanComplete / $totalKaryawan) * 100, 2) : 100,
        ];
    }

    public function evaluateUniqueness(): array
    {
        $totalSiswa = Siswa::count();
        $uniqueNisn = Siswa::distinct('nisn')->count('nisn');
        $duplicateNisn = $totalSiswa - $uniqueNisn;

        $totalKaryawan = Karyawan::count();
        $uniqueNik = Karyawan::distinct('nik')->count('nik');
        $duplicateNik = $totalKaryawan - $uniqueNik;

        $total = $totalSiswa + $totalKaryawan;
        $duplicates = $duplicateNisn + $duplicateNik;
        $score = $total > 0 ? round((($total - $duplicates) / $total) * 100, 2) : 100;

        return [
            'score' => $score,
            'duplicates_found' => $duplicates,
            'duplicate_nisn' => $duplicateNisn,
            'duplicate_nik' => $duplicateNik,
        ];
    }

    public function evaluateConsistency(): array
    {
        // Check orphaned siswa records (unit_id or orang_tua_id not existing)
        $orphanedUnitSiswa = Siswa::whereNotIn('unit_id', Unit::select('id'))->count();
        $orphanedOrtuSiswa = Siswa::whereNotNull('orang_tua_id')
            ->whereNotIn('orang_tua_id', OrangTua::select('id'))
            ->count();

        // Check orphaned karyawan records
        $orphanedUnitKaryawan = Karyawan::whereNotIn('unit_id', Unit::select('id'))->count();

        $totalOrphaned = $orphanedUnitSiswa + $orphanedOrtuSiswa + $orphanedUnitKaryawan;
        $totalChecked = Siswa::count() + Karyawan::count();
        $score = $totalChecked > 0 ? round((($totalChecked - $totalOrphaned) / $totalChecked) * 100, 2) : 100;

        return [
            'score' => $score,
            'orphaned_records' => $totalOrphaned,
            'orphaned_unit_siswa' => $orphanedUnitSiswa,
            'orphaned_ortu_siswa' => $orphanedOrtuSiswa,
            'orphaned_unit_karyawan' => $orphanedUnitKaryawan,
        ];
    }

    public function evaluateValidity(): array
    {
        $siswa = Siswa::all();
        $validSiswa = 0;

        foreach ($siswa as $s) {
            $isNisnValid = preg_match('/^[0-9]{10}$/', (string)$s->nisn);
            $isNikValid = empty($s->nik) || preg_match('/^[0-9]{16}$/', (string)$s->nik);
            if ($isNisnValid && $isNikValid) {
                $validSiswa++;
            }
        }

        $karyawan = Karyawan::all();
        $validKaryawan = 0;
        foreach ($karyawan as $k) {
            $isNikValid = preg_match('/^[0-9]{16}$/', (string)$k->nik);
            $isEmailValid = filter_var($k->email, FILTER_VALIDATE_EMAIL);
            if ($isNikValid && $isEmailValid) {
                $validKaryawan++;
            }
        }

        $totalChecked = count($siswa) + count($karyawan);
        $totalValid = $validSiswa + $validKaryawan;
        $score = $totalChecked > 0 ? round(($totalValid / $totalChecked) * 100, 2) : 100;

        return [
            'score' => $score,
            'valid_records' => $totalValid,
            'invalid_records' => $totalChecked - $totalValid,
        ];
    }

    public function evaluateAccuracy(): array
    {
        $siswaWithUnit = Siswa::with('unit')->get();
        $accurateCount = 0;

        foreach ($siswaWithUnit as $s) {
            if (!$s->unit) continue;
            $age = Carbon::parse($s->tanggal_lahir)->age;
            $minAge = match ($s->unit->jenjang) {
                'PG' => 2,
                'TK' => 4,
                'SD' => 6,
                'SMP' => 11,
                'SMA' => 14,
                'BOARDING' => 11,
                default => 0,
            };
            $maxAge = match ($s->unit->jenjang) {
                'PG' => 6,
                'TK' => 8,
                'SD' => 14,
                'SMP' => 18,
                'SMA' => 21,
                'BOARDING' => 21,
                default => 100,
            };

            if ($age >= $minAge && $age <= $maxAge) {
                $accurateCount++;
            }
        }

        $total = count($siswaWithUnit);
        $score = $total > 0 ? round(($accurateCount / $total) * 100, 2) : 100;

        return [
            'score' => $score,
            'accurate_records' => $accurateCount,
            'inaccurate_records' => $total - $accurateCount,
        ];
    }

    private function calculateOverallScore(): float
    {
        $comp = $this->evaluateCompleteness()['score'];
        $uniq = $this->evaluateUniqueness()['score'];
        $cons = $this->evaluateConsistency()['score'];
        $val = $this->evaluateValidity()['score'];
        $acc = $this->evaluateAccuracy()['score'];

        return round(($comp + $uniq + $cons + $val + $acc) / 5, 2);
    }
}
