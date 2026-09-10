<?php

namespace App\Services;

use App\Models\Bangunan;
use App\Models\Karyawan;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\OrangTua;
use App\Models\Ruang;
use App\Models\Siswa;
use App\Models\Vendor;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MasterDataExportService
{
    // ================= SISWA =================
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
            fputs($out, "\xEF\xBB\xBF");

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

    // ================= KARYAWAN =================
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

    // ================= ORANG TUA =================
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

    // ================= KELAS =================
    public function exportKelas(array $filters = []): StreamedResponse
    {
        $query = Kelas::query()->with(['unit', 'tahunAjaran', 'waliKelas'])->withCount(['anggotaKelas' => fn($q) => $q->where('status', 'aktif')]);

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }
        if (!empty($filters['tahun_ajaran_id'])) {
            $query->where('tahun_ajaran_id', $filters['tahun_ajaran_id']);
        }
        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('nama_kelas', 'like', "%{$s}%")
                  ->orWhere('kode_kelas', 'like', "%{$s}%");
            });
        }

        $filename = 'data-kelas-' . date('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'ID', 'Kode Kelas', 'Nama Kelas', 'Tingkat', 'Kode Unit', 'Unit Sekolah',
                'Kode TA', 'Wali Kelas', 'NIP Wali', 'Kapasitas', 'Jumlah Siswa Aktif'
            ]);

            $query->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $k) {
                    fputcsv($out, [
                        $k->id,
                        $k->kode_kelas,
                        $k->nama_kelas,
                        $k->tingkat,
                        $k->unit?->kode_unit ?: '',
                        $k->unit?->nama_unit ?: '',
                        $k->tahunAjaran?->kode ?: '',
                        $k->waliKelas?->nama ?: '',
                        $k->waliKelas?->nip ?: '',
                        $k->kapasitas,
                        $k->anggota_kelas_count ?? 0,
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function templateKelas(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'kode_kelas', 'nama_kelas', 'tingkat', 'kode_unit', 'kode_tahun_ajaran', 'nip_wali_kelas', 'kapasitas'
            ]);
            fputcsv($out, [
                'KLS-SD-1C', 'Kelas 1C Al-Battani', '1', 'SD', 'TA-2025/2026-GANJIL', '', '30'
            ]);
            fclose($out);
        }, 'template-impor-kelas.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    // ================= MATA PELAJARAN =================
    public function exportMataPelajaran(array $filters = []): StreamedResponse
    {
        $query = MataPelajaran::query()->with('unit');

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }
        if (!empty($filters['kelompok'])) {
            $query->where('kelompok', $filters['kelompok']);
        }
        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('nama_mapel', 'like', "%{$s}%")
                  ->orWhere('kode_mapel', 'like', "%{$s}%");
            });
        }

        $filename = 'data-mata-pelajaran-' . date('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'ID', 'Kode Mapel', 'Nama Mata Pelajaran', 'Kode Unit', 'Unit Sekolah',
                'Kelompok', 'Beban Jam (JP)', 'Keterangan'
            ]);

            $query->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $m) {
                    fputcsv($out, [
                        $m->id,
                        $m->kode_mapel,
                        $m->nama_mapel,
                        $m->unit?->kode_unit ?: '',
                        $m->unit?->nama_unit ?: '',
                        $m->kelompok,
                        $m->beban_jam,
                        $m->keterangan ?: '',
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function templateMataPelajaran(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'kode_mapel', 'nama_mapel', 'kode_unit', 'kelompok', 'beban_jam', 'keterangan'
            ]);
            fputcsv($out, [
                'ROB-SMP', 'Robotika & Kecerdasan Buatan', 'SMP', 'ekstrakurikuler', '2', 'Kurikulum Tambahan'
            ]);
            fclose($out);
        }, 'template-impor-mata-pelajaran.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    // ================= BANGUNAN =================
    public function exportBangunan(array $filters = []): StreamedResponse
    {
        $query = Bangunan::query()->with('unit')->withCount('ruang');

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }
        if (!empty($filters['kondisi'])) {
            $query->where('kondisi', $filters['kondisi']);
        }
        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('nama_bangunan', 'like', "%{$s}%")
                  ->orWhere('kode_bangunan', 'like', "%{$s}%");
            });
        }

        $filename = 'data-bangunan-' . date('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'ID', 'Kode Bangunan', 'Nama Bangunan', 'Kode Unit', 'Unit Sekolah',
                'Jumlah Lantai', 'Luas (m2)', 'Kondisi', 'Jumlah Ruang', 'Keterangan'
            ]);

            $query->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $b) {
                    fputcsv($out, [
                        $b->id,
                        $b->kode_bangunan,
                        $b->nama_bangunan,
                        $b->unit?->kode_unit ?: '',
                        $b->unit?->nama_unit ?: '',
                        $b->jumlah_lantai,
                        $b->luas ?: '',
                        $b->kondisi,
                        $b->ruang_count ?? 0,
                        $b->keterangan ?: '',
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function templateBangunan(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'kode_bangunan', 'nama_bangunan', 'kode_unit', 'jumlah_lantai', 'luas', 'kondisi', 'keterangan'
            ]);
            fputcsv($out, [
                'GDG-SMP-B', 'Gedung Olahraga & Serbaguna', 'SMP', '2', '850', 'baik', 'Fasilitas Indoor'
            ]);
            fclose($out);
        }, 'template-impor-bangunan.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    // ================= RUANG =================
    public function exportRuang(array $filters = []): StreamedResponse
    {
        $query = Ruang::query()->with('bangunan.unit');

        if (!empty($filters['bangunan_id'])) {
            $query->where('bangunan_id', $filters['bangunan_id']);
        }
        if (!empty($filters['fungsi'])) {
            $query->where('fungsi', $filters['fungsi']);
        }
        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('nama_ruang', 'like', "%{$s}%")
                  ->orWhere('kode_ruang', 'like', "%{$s}%");
            });
        }

        $filename = 'data-ruang-' . date('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'ID', 'Kode Ruang', 'Nama Ruangan', 'Kode Bangunan', 'Nama Gedung',
                'Unit Sekolah', 'Lantai', 'Fungsi', 'Kapasitas', 'Kondisi', 'Keterangan'
            ]);

            $query->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $r) {
                    fputcsv($out, [
                        $r->id,
                        $r->kode_ruang,
                        $r->nama_ruang,
                        $r->bangunan?->kode_bangunan ?: '',
                        $r->bangunan?->nama_bangunan ?: '',
                        $r->bangunan?->unit?->nama_unit ?: '',
                        $r->lantai,
                        $r->fungsi,
                        $r->kapasitas,
                        $r->kondisi,
                        $r->keterangan ?: '',
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function templateRuang(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'kode_ruang', 'nama_ruang', 'kode_bangunan', 'lantai', 'fungsi', 'kapasitas', 'kondisi', 'keterangan'
            ]);
            fputcsv($out, [
                'R-SD-205', 'Ruang Multimedia & Podcast', 'GDG-SD-A', '2', 'laboratorium', '25', 'baik', 'Perangkat Audio Visual'
            ]);
            fclose($out);
        }, 'template-impor-ruang.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    // ================= VENDOR =================
    public function exportVendor(array $filters = []): StreamedResponse
    {
        $query = Vendor::query();

        if (!empty($filters['kategori'])) {
            $query->where('kategori', $filters['kategori']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('nama_vendor', 'like', "%{$s}%")
                  ->orWhere('kode_vendor', 'like', "%{$s}%");
            });
        }

        $filename = 'data-vendor-' . date('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'ID', 'Kode Vendor', 'Nama Perusahaan', 'Kategori',
                'Nama Kontak PIC', 'Telepon', 'Email', 'Alamat', 'Status'
            ]);

            $query->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $v) {
                    fputcsv($out, [
                        $v->id,
                        $v->kode_vendor,
                        $v->nama_vendor,
                        $v->kategori,
                        $v->nama_kontak ?: '',
                        $v->telepon,
                        $v->email ?: '',
                        $v->alamat ?: '',
                        $v->status,
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function templateVendor(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputs($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'kode_vendor', 'nama_vendor', 'kategori', 'nama_kontak', 'telepon', 'email', 'alamat', 'status'
            ]);
            fputcsv($out, [
                'VND-006', 'CV Berkah Alat Tulis', 'sarana_prasarana', 'Bambang Supriyanto', '081234567890', 'sales@berkahat.com', 'Jl. Masjid No. 20, Purwokerto', 'aktif'
            ]);
            fclose($out);
        }, 'template-impor-vendor.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
