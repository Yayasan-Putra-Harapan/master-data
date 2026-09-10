<?php

namespace App\Services;

use App\Models\Karyawan;
use App\Models\OrangTua;
use App\Models\Siswa;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MasterDataExportService
{
    public function exportSiswa(array $filters = []): StreamedResponse
    {
        $query = Siswa::query()->with(['unit', 'orangTua']);

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('nama_lengkap', 'like', "%{$s}%")
                  ->orWhere('nisn', 'like', "%{$s}%");
            });
        }

        $filename = 'data-siswa-' . date('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel

            fputcsv($out, [
                'ID', 'NISN', 'NIS', 'NIK', 'Nama Lengkap', 'Gender',
                'Tempat Lahir', 'Tanggal Lahir', 'Agama', 'Kode Unit', 'Unit Sekolah',
                'Nama Wali', 'Kontak Wali', 'Alamat', 'Angkatan', 'Status'
            ]);

            $query->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $s) {
                    $wali = $s->orangTua ? ($s->orangTua->nama_ayah ?: $s->orangTua->nama_ibu ?: $s->orangTua->nama_wali) : '';
                    fputcsv($out, [
                        $s->id,
                        $s->nisn,
                        $s->nis ?: '',
                        $s->nik ?: '',
                        $s->nama_lengkap,
                        $s->jenis_kelamin,
                        $s->tempat_lahir,
                        $s->tanggal_lahir?->format('Y-m-d') ?: '',
                        $s->agama ?: '',
                        $s->unit?->kode_unit ?: '',
                        $s->unit?->nama_unit ?: '',
                        $wali,
                        $s->orangTua?->telepon ?: '',
                        $s->alamat,
                        $s->angkatan,
                        $s->status,
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    public function templateSiswa(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'nisn', 'nis', 'nik', 'nama_lengkap', 'nama_panggilan', 'jenis_kelamin',
                'tempat_lahir', 'tanggal_lahir', 'agama', 'kode_unit', 'alamat', 'angkatan', 'status'
            ]);
            fputcsv($out, [
                '0098765432', '20250001', '3302010101150001', 'Ahmad Dani Pratama', 'Ahmad', 'L',
                'Purwokerto', '2015-05-12', 'Islam', 'SD', 'Jl. Merdeka No. 10, Purwokerto', '2025', 'aktif'
            ]);
            fclose($out);
        }, 'template-impor-siswa.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function exportKaryawan(array $filters = []): StreamedResponse
    {
        $query = Karyawan::query()->with('unit');

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }
        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }
        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('nama', 'like', "%{$s}%")
                  ->orWhere('nik', 'like', "%{$s}%");
            });
        }

        $filename = 'data-karyawan-' . date('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'ID', 'NIK', 'NIP', 'NUPTK', 'Nama Lengkap', 'Gender',
                'Tempat Lahir', 'Tanggal Lahir', 'Kode Unit', 'Unit Sekolah',
                'Peran', 'Status Kerja', 'Telepon', 'Email', 'Pendidikan', 'Tanggal Masuk', 'Status Aktif'
            ]);

            $query->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $k) {
                    fputcsv($out, [
                        $k->id,
                        $k->nik,
                        $k->nip ?: '',
                        $k->nuptk ?: '',
                        $k->nama,
                        $k->jenis_kelamin,
                        $k->tempat_lahir ?: '',
                        $k->tanggal_lahir?->format('Y-m-d') ?: '',
                        $k->unit?->kode_unit ?: '',
                        $k->unit?->nama_unit ?: '',
                        $k->role,
                        $k->status_kepegawaian,
                        $k->telepon,
                        $k->email,
                        $k->pendidikan_terakhir ?: '',
                        $k->tanggal_masuk?->format('Y-m-d') ?: '',
                        $k->is_aktif ? 'Aktif' : 'Non-aktif',
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function templateKaryawan(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'nik', 'nip', 'nuptk', 'nama', 'jenis_kelamin', 'tempat_lahir',
                'tanggal_lahir', 'kode_unit', 'role', 'status_kepegawaian', 'telepon', 'email',
                'pendidikan_terakhir', 'tanggal_masuk', 'alamat'
            ]);
            fputcsv($out, [
                '3302010101850001', '198501012010011001', '1234567890123456', 'Siti Rahmawati, S.Pd.', 'P', 'Banyumas',
                '1985-04-15', 'SMP', 'guru', 'tetap', '081234567890', 'siti.rahma@yayasan.ac.id',
                'S1 Pendidikan Matematika', '2015-08-01', 'Jl. Suparno No. 45, Purwokerto'
            ]);
            fclose($out);
        }, 'template-impor-karyawan.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function exportOrangTua(array $filters = []): StreamedResponse
    {
        $query = OrangTua::query()->withCount('siswa');

        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('nama_ayah', 'like', "%{$s}%")
                  ->orWhere('nama_ibu', 'like', "%{$s}%")
                  ->orWhere('no_kk', 'like', "%{$s}%");
            });
        }

        $filename = 'data-orang-tua-' . date('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'ID', 'No. KK', 'Nama Ayah', 'NIK Ayah', 'Pekerjaan Ayah',
                'Nama Ibu', 'NIK Ibu', 'Pekerjaan Ibu', 'Nama Wali', 'Telepon', 'Email', 'Alamat', 'Jumlah Siswa'
            ]);

            $query->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $o) {
                    fputcsv($out, [
                        $o->id,
                        $o->no_kk ?: '',
                        $o->nama_ayah ?: '',
                        $o->nik_ayah ?: '',
                        $o->pekerjaan_ayah ?: '',
                        $o->nama_ibu ?: '',
                        $o->nik_ibu ?: '',
                        $o->pekerjaan_ibu ?: '',
                        $o->nama_wali ?: '',
                        $o->telepon,
                        $o->email ?: '',
                        $o->alamat,
                        $o->siswa_count ?? 0,
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
