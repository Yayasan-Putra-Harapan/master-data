<?php

namespace App\Services;

use App\Models\Bangunan;
use App\Models\Karyawan;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Ruang;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\Unit;
use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MasterDataImportService
{
    // ================= SISWA =================
    public function importSiswa(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) {
            return ['success' => false, 'message' => 'Gagal membaca berkas CSV.'];
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['success' => false, 'message' => 'Berkas CSV kosong.'];
        }

        $header[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $header[0]);
        $header = array_map('trim', array_map('strtolower', $header));

        $expected = ['nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'kode_unit', 'alamat', 'angkatan'];
        foreach ($expected as $exp) {
            if (!in_array($exp, $header)) {
                fclose($handle);
                return [
                    'success' => false,
                    'message' => "Kolom wajib '{$exp}' tidak ditemukan pada header berkas CSV."
                ];
            }
        }

        $rowNum = 1;
        $imported = 0;
        $errors = [];
        $unitsCache = Unit::pluck('id', 'kode_unit')->toArray();

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNum++;
                if (empty(array_filter($row))) continue;

                $data = array_combine($header, array_pad($row, count($header), null));
                $data = array_map(fn($v) => is_string($v) ? trim($v) : $v, $data);

                $kodeUnit = strtoupper($data['kode_unit'] ?? '');
                $unitId = $unitsCache[$kodeUnit] ?? null;

                $validator = Validator::make([
                    'nisn' => $data['nisn'] ?? null,
                    'nama_lengkap' => $data['nama_lengkap'] ?? null,
                    'jenis_kelamin' => strtoupper($data['jenis_kelamin'] ?? ''),
                    'tempat_lahir' => $data['tempat_lahir'] ?? null,
                    'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
                    'unit_id' => $unitId,
                    'alamat' => $data['alamat'] ?? null,
                    'angkatan' => $data['angkatan'] ?? null,
                    'status' => strtolower($data['status'] ?? 'aktif'),
                ], [
                    'nisn' => ['required', 'digits:10', 'unique:siswa,nisn'],
                    'nama_lengkap' => ['required', 'string', 'max:150'],
                    'jenis_kelamin' => ['required', 'in:L,P'],
                    'tempat_lahir' => ['required', 'string', 'max:100'],
                    'tanggal_lahir' => ['required', 'date'],
                    'unit_id' => ['required', 'exists:units,id'],
                    'alamat' => ['required', 'string', 'max:500'],
                    'angkatan' => ['required', 'integer', 'between:2010,2035'],
                    'status' => ['required', 'in:aktif,lulus,mutasi,keluar'],
                ], [
                    'nisn.digits' => 'NISN harus 10 digit',
                    'nisn.unique' => 'NISN sudah ada',
                    'unit_id.required' => "Unit '{$kodeUnit}' tidak ditemukan",
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNum}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                Siswa::create([
                    'nisn' => $data['nisn'],
                    'nis' => !empty($data['nis']) ? $data['nis'] : null,
                    'nik' => !empty($data['nik']) ? $data['nik'] : null,
                    'nama_lengkap' => $data['nama_lengkap'],
                    'nama_panggilan' => $data['nama_panggilan'] ?? null,
                    'jenis_kelamin' => strtoupper($data['jenis_kelamin']),
                    'tempat_lahir' => $data['tempat_lahir'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'agama' => $data['agama'] ?? 'Islam',
                    'unit_id' => $unitId,
                    'alamat' => $data['alamat'],
                    'angkatan' => (int)$data['angkatan'],
                    'status' => strtolower($data['status'] ?? 'aktif'),
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);

            return [
                'success' => true,
                'imported' => $imported,
                'errors' => $errors,
                'total_rows' => $rowNum - 1,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ];
        }
    }

    // ================= KARYAWAN =================
    public function importKaryawan(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) {
            return ['success' => false, 'message' => 'Gagal membaca berkas CSV.'];
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['success' => false, 'message' => 'Berkas CSV kosong.'];
        }

        $header[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $header[0]);
        $header = array_map('trim', array_map('strtolower', $header));

        $expected = ['nik', 'nama', 'jenis_kelamin', 'tanggal_lahir', 'kode_unit', 'role', 'telepon', 'email', 'tanggal_masuk'];
        foreach ($expected as $exp) {
            if (!in_array($exp, $header)) {
                fclose($handle);
                return [
                    'success' => false,
                    'message' => "Kolom wajib '{$exp}' tidak ditemukan pada header berkas CSV."
                ];
            }
        }

        $rowNum = 1;
        $imported = 0;
        $errors = [];
        $unitsCache = Unit::pluck('id', 'kode_unit')->toArray();

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNum++;
                if (empty(array_filter($row))) continue;

                $data = array_combine($header, array_pad($row, count($header), null));
                $data = array_map(fn($v) => is_string($v) ? trim($v) : $v, $data);

                $kodeUnit = strtoupper($data['kode_unit'] ?? '');
                $unitId = $unitsCache[$kodeUnit] ?? null;

                $validator = Validator::make([
                    'nik' => $data['nik'] ?? null,
                    'nama' => $data['nama'] ?? null,
                    'jenis_kelamin' => strtoupper($data['jenis_kelamin'] ?? ''),
                    'tanggal_lahir' => $data['tanggal_lahir'] ?? null,
                    'unit_id' => $unitId,
                    'role' => strtolower($data['role'] ?? ''),
                    'status_kepegawaian' => strtolower($data['status_kepegawaian'] ?? 'tetap'),
                    'telepon' => $data['telepon'] ?? null,
                    'email' => $data['email'] ?? null,
                    'tanggal_masuk' => $data['tanggal_masuk'] ?? null,
                ], [
                    'nik' => ['required', 'digits:16', 'unique:karyawan,nik'],
                    'nama' => ['required', 'string', 'max:100'],
                    'jenis_kelamin' => ['required', 'in:L,P'],
                    'tanggal_lahir' => ['required', 'date'],
                    'unit_id' => ['required', 'exists:units,id'],
                    'role' => ['required', 'in:guru,staf,kepala_sekolah,keuangan,administrasi'],
                    'status_kepegawaian' => ['required', 'in:tetap,kontrak,honorer'],
                    'telepon' => ['required', 'string'],
                    'email' => ['required', 'email', 'unique:karyawan,email'],
                    'tanggal_masuk' => ['required', 'date'],
                ], [
                    'nik.digits' => 'NIK harus 16 digit',
                    'nik.unique' => 'NIK sudah terdaftar',
                    'email.unique' => 'Email sudah terdaftar',
                    'unit_id.required' => "Unit '{$kodeUnit}' tidak ditemukan",
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNum}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                Karyawan::create([
                    'nik' => $data['nik'],
                    'nip' => !empty($data['nip']) ? $data['nip'] : null,
                    'nuptk' => !empty($data['nuptk']) ? $data['nuptk'] : null,
                    'nama' => $data['nama'],
                    'jenis_kelamin' => strtoupper($data['jenis_kelamin']),
                    'tempat_lahir' => $data['tempat_lahir'] ?? null,
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'unit_id' => $unitId,
                    'role' => strtolower($data['role']),
                    'status_kepegawaian' => strtolower($data['status_kepegawaian'] ?? 'tetap'),
                    'telepon' => $data['telepon'],
                    'email' => $data['email'],
                    'alamat' => $data['alamat'] ?? null,
                    'pendidikan_terakhir' => $data['pendidikan_terakhir'] ?? null,
                    'tanggal_masuk' => $data['tanggal_masuk'],
                    'is_aktif' => true,
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);

            return [
                'success' => true,
                'imported' => $imported,
                'errors' => $errors,
                'total_rows' => $rowNum - 1,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ];
        }
    }

    // ================= KELAS =================
    public function importKelas(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) return ['success' => false, 'message' => 'Gagal membaca berkas CSV.'];

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['success' => false, 'message' => 'Berkas CSV kosong.'];
        }

        $header[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $header[0]);
        $header = array_map('trim', array_map('strtolower', $header));

        $expected = ['kode_kelas', 'nama_kelas', 'tingkat', 'kode_unit', 'kode_tahun_ajaran'];
        foreach ($expected as $exp) {
            if (!in_array($exp, $header)) {
                fclose($handle);
                return ['success' => false, 'message' => "Kolom wajib '{$exp}' tidak ditemukan."];
            }
        }

        $rowNum = 1;
        $imported = 0;
        $errors = [];
        $unitsCache = Unit::pluck('id', 'kode_unit')->toArray();
        $taCache = TahunAjaran::pluck('id', 'kode')->toArray();
        $karyawanCache = Karyawan::whereNotNull('nip')->pluck('id', 'nip')->toArray();

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNum++;
                if (empty(array_filter($row))) continue;

                $data = array_combine($header, array_pad($row, count($header), null));
                $data = array_map(fn($v) => is_string($v) ? trim($v) : $v, $data);

                $unitId = $unitsCache[strtoupper($data['kode_unit'] ?? '')] ?? null;
                $taId = $taCache[strtoupper($data['kode_tahun_ajaran'] ?? '')] ?? null;
                $waliId = !empty($data['nip_wali_kelas']) ? ($karyawanCache[$data['nip_wali_kelas']] ?? null) : null;

                $validator = Validator::make([
                    'kode_kelas' => $data['kode_kelas'] ?? null,
                    'nama_kelas' => $data['nama_kelas'] ?? null,
                    'tingkat' => $data['tingkat'] ?? null,
                    'unit_id' => $unitId,
                    'tahun_ajaran_id' => $taId,
                    'kapasitas' => (int)($data['kapasitas'] ?? 30),
                ], [
                    'kode_kelas' => ['required', 'string', 'max:30', 'unique:kelas,kode_kelas'],
                    'nama_kelas' => ['required', 'string', 'max:100'],
                    'tingkat' => ['required', 'integer', 'between:1,12'],
                    'unit_id' => ['required', 'exists:units,id'],
                    'tahun_ajaran_id' => ['required', 'exists:tahun_ajaran,id'],
                    'kapasitas' => ['required', 'integer', 'between:1,60'],
                ], [
                    'kode_kelas.unique' => 'Kode kelas sudah terdaftar',
                    'unit_id.required' => 'Kode unit tidak valid',
                    'tahun_ajaran_id.required' => 'Kode tahun ajaran tidak valid',
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNum}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                Kelas::create([
                    'kode_kelas' => strtoupper($data['kode_kelas']),
                    'nama_kelas' => $data['nama_kelas'],
                    'tingkat' => (int)$data['tingkat'],
                    'unit_id' => $unitId,
                    'tahun_ajaran_id' => $taId,
                    'wali_kelas_id' => $waliId,
                    'kapasitas' => (int)($data['kapasitas'] ?? 30),
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);
            return ['success' => true, 'imported' => $imported, 'errors' => $errors, 'total_rows' => $rowNum - 1];
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    // ================= MATA PELAJARAN =================
    public function importMataPelajaran(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) return ['success' => false, 'message' => 'Gagal membaca berkas CSV.'];

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['success' => false, 'message' => 'Berkas CSV kosong.'];
        }

        $header[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $header[0]);
        $header = array_map('trim', array_map('strtolower', $header));

        $expected = ['kode_mapel', 'nama_mapel', 'kode_unit', 'kelompok', 'beban_jam'];
        foreach ($expected as $exp) {
            if (!in_array($exp, $header)) {
                fclose($handle);
                return ['success' => false, 'message' => "Kolom wajib '{$exp}' tidak ditemukan."];
            }
        }

        $rowNum = 1;
        $imported = 0;
        $errors = [];
        $unitsCache = Unit::pluck('id', 'kode_unit')->toArray();

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNum++;
                if (empty(array_filter($row))) continue;

                $data = array_combine($header, array_pad($row, count($header), null));
                $data = array_map(fn($v) => is_string($v) ? trim($v) : $v, $data);

                $unitId = $unitsCache[strtoupper($data['kode_unit'] ?? '')] ?? null;
                $kelompok = strtolower($data['kelompok'] ?? 'wajib');

                $validator = Validator::make([
                    'kode_mapel' => $data['kode_mapel'] ?? null,
                    'nama_mapel' => $data['nama_mapel'] ?? null,
                    'unit_id' => $unitId,
                    'kelompok' => $kelompok,
                    'beban_jam' => (int)($data['beban_jam'] ?? 2),
                ], [
                    'kode_mapel' => ['required', 'string', 'max:30', 'unique:mata_pelajaran,kode_mapel'],
                    'nama_mapel' => ['required', 'string', 'max:100'],
                    'unit_id' => ['required', 'exists:units,id'],
                    'kelompok' => ['required', 'in:wajib,peminatan,muatan_lokal,ekstrakurikuler'],
                    'beban_jam' => ['required', 'integer', 'between:1,10'],
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNum}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                MataPelajaran::create([
                    'kode_mapel' => strtoupper($data['kode_mapel']),
                    'nama_mapel' => $data['nama_mapel'],
                    'unit_id' => $unitId,
                    'kelompok' => $kelompok,
                    'beban_jam' => (int)$data['beban_jam'],
                    'keterangan' => $data['keterangan'] ?? null,
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);
            return ['success' => true, 'imported' => $imported, 'errors' => $errors, 'total_rows' => $rowNum - 1];
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    // ================= BANGUNAN =================
    public function importBangunan(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) return ['success' => false, 'message' => 'Gagal membaca berkas CSV.'];

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['success' => false, 'message' => 'Berkas CSV kosong.'];
        }

        $header[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $header[0]);
        $header = array_map('trim', array_map('strtolower', $header));

        $expected = ['kode_bangunan', 'nama_bangunan', 'kode_unit', 'jumlah_lantai'];
        foreach ($expected as $exp) {
            if (!in_array($exp, $header)) {
                fclose($handle);
                return ['success' => false, 'message' => "Kolom wajib '{$exp}' tidak ditemukan."];
            }
        }

        $rowNum = 1;
        $imported = 0;
        $errors = [];
        $unitsCache = Unit::pluck('id', 'kode_unit')->toArray();

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNum++;
                if (empty(array_filter($row))) continue;

                $data = array_combine($header, array_pad($row, count($header), null));
                $data = array_map(fn($v) => is_string($v) ? trim($v) : $v, $data);

                $unitId = $unitsCache[strtoupper($data['kode_unit'] ?? '')] ?? null;
                $kondisi = strtolower($data['kondisi'] ?? 'baik');

                $validator = Validator::make([
                    'kode_bangunan' => $data['kode_bangunan'] ?? null,
                    'nama_bangunan' => $data['nama_bangunan'] ?? null,
                    'unit_id' => $unitId,
                    'jumlah_lantai' => (int)($data['jumlah_lantai'] ?? 1),
                    'kondisi' => $kondisi,
                ], [
                    'kode_bangunan' => ['required', 'string', 'max:30', 'unique:bangunan,kode_bangunan'],
                    'nama_bangunan' => ['required', 'string', 'max:100'],
                    'unit_id' => ['required', 'exists:units,id'],
                    'jumlah_lantai' => ['required', 'integer', 'between:1,10'],
                    'kondisi' => ['required', 'in:baik,rusak_ringan,rusak_berat'],
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNum}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                Bangunan::create([
                    'kode_bangunan' => strtoupper($data['kode_bangunan']),
                    'nama_bangunan' => $data['nama_bangunan'],
                    'unit_id' => $unitId,
                    'jumlah_lantai' => (int)$data['jumlah_lantai'],
                    'luas' => !empty($data['luas']) ? (float)$data['luas'] : null,
                    'kondisi' => $kondisi,
                    'keterangan' => $data['keterangan'] ?? null,
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);
            return ['success' => true, 'imported' => $imported, 'errors' => $errors, 'total_rows' => $rowNum - 1];
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    // ================= RUANG =================
    public function importRuang(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) return ['success' => false, 'message' => 'Gagal membaca berkas CSV.'];

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['success' => false, 'message' => 'Berkas CSV kosong.'];
        }

        $header[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $header[0]);
        $header = array_map('trim', array_map('strtolower', $header));

        $expected = ['kode_ruang', 'nama_ruang', 'kode_bangunan', 'lantai', 'fungsi'];
        foreach ($expected as $exp) {
            if (!in_array($exp, $header)) {
                fclose($handle);
                return ['success' => false, 'message' => "Kolom wajib '{$exp}' tidak ditemukan."];
            }
        }

        $rowNum = 1;
        $imported = 0;
        $errors = [];
        $bangunanCache = Bangunan::pluck('id', 'kode_bangunan')->toArray();

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNum++;
                if (empty(array_filter($row))) continue;

                $data = array_combine($header, array_pad($row, count($header), null));
                $data = array_map(fn($v) => is_string($v) ? trim($v) : $v, $data);

                $bangunanId = $bangunanCache[strtoupper($data['kode_bangunan'] ?? '')] ?? null;
                $fungsi = strtolower($data['fungsi'] ?? 'kelas');
                $kondisi = strtolower($data['kondisi'] ?? 'baik');

                $validator = Validator::make([
                    'kode_ruang' => $data['kode_ruang'] ?? null,
                    'nama_ruang' => $data['nama_ruang'] ?? null,
                    'bangunan_id' => $bangunanId,
                    'lantai' => (int)($data['lantai'] ?? 1),
                    'fungsi' => $fungsi,
                    'kapasitas' => (int)($data['kapasitas'] ?? 30),
                    'kondisi' => $kondisi,
                ], [
                    'kode_ruang' => ['required', 'string', 'max:30', 'unique:ruang,kode_ruang'],
                    'nama_ruang' => ['required', 'string', 'max:100'],
                    'bangunan_id' => ['required', 'exists:bangunan,id'],
                    'lantai' => ['required', 'integer', 'between:1,10'],
                    'fungsi' => ['required', 'in:kelas,laboratorium,perpustakaan,kantor,aula,ibadah,lainnya'],
                    'kapasitas' => ['required', 'integer', 'between:1,500'],
                    'kondisi' => ['required', 'in:baik,rusak_ringan,rusak_berat'],
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNum}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                Ruang::create([
                    'kode_ruang' => strtoupper($data['kode_ruang']),
                    'nama_ruang' => $data['nama_ruang'],
                    'bangunan_id' => $bangunanId,
                    'lantai' => (int)$data['lantai'],
                    'fungsi' => $fungsi,
                    'kapasitas' => (int)($data['kapasitas'] ?? 30),
                    'kondisi' => $kondisi,
                    'keterangan' => $data['keterangan'] ?? null,
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);
            return ['success' => true, 'imported' => $imported, 'errors' => $errors, 'total_rows' => $rowNum - 1];
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    // ================= VENDOR =================
    public function importVendor(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) return ['success' => false, 'message' => 'Gagal membaca berkas CSV.'];

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['success' => false, 'message' => 'Berkas CSV kosong.'];
        }

        $header[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $header[0]);
        $header = array_map('trim', array_map('strtolower', $header));

        $expected = ['kode_vendor', 'nama_vendor', 'kategori', 'telepon'];
        foreach ($expected as $exp) {
            if (!in_array($exp, $header)) {
                fclose($handle);
                return ['success' => false, 'message' => "Kolom wajib '{$exp}' tidak ditemukan."];
            }
        }

        $rowNum = 1;
        $imported = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNum++;
                if (empty(array_filter($row))) continue;

                $data = array_combine($header, array_pad($row, count($header), null));
                $data = array_map(fn($v) => is_string($v) ? trim($v) : $v, $data);

                $kategori = strtolower($data['kategori'] ?? 'lainnya');
                $status = strtolower($data['status'] ?? 'aktif');

                $validator = Validator::make([
                    'kode_vendor' => $data['kode_vendor'] ?? null,
                    'nama_vendor' => $data['nama_vendor'] ?? null,
                    'kategori' => $kategori,
                    'telepon' => $data['telepon'] ?? null,
                    'status' => $status,
                ], [
                    'kode_vendor' => ['required', 'string', 'max:30', 'unique:vendor,kode_vendor'],
                    'nama_vendor' => ['required', 'string', 'max:100'],
                    'kategori' => ['required', 'in:sarana_prasarana,buku_pelajaran,katering,seragam,teknologi,kebersihan,lainnya'],
                    'telepon' => ['required', 'string'],
                    'status' => ['required', 'in:aktif,non_aktif'],
                ]);

                if ($validator->fails()) {
                    $errors[] = "Baris {$rowNum}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                Vendor::create([
                    'kode_vendor' => strtoupper($data['kode_vendor']),
                    'nama_vendor' => $data['nama_vendor'],
                    'kategori' => $kategori,
                    'nama_kontak' => $data['nama_kontak'] ?? null,
                    'telepon' => $data['telepon'],
                    'email' => !empty($data['email']) ? $data['email'] : null,
                    'alamat' => $data['alamat'] ?? null,
                    'status' => $status,
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);
            return ['success' => true, 'imported' => $imported, 'errors' => $errors, 'total_rows' => $rowNum - 1];
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
