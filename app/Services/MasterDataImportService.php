<?php

namespace App\Services;

use App\Models\Karyawan;
use App\Models\Siswa;
use App\Models\Unit;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MasterDataImportService
{
    public function importSiswa(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) {
            return ['success' => false, 'message' => 'Gagal membaca berkas CSV.'];
        }

        // Read header
        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return ['success' => false, 'message' => 'Berkas CSV kosong.'];
        }

        // Clean UTF-8 BOM if present
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
                if (empty(array_filter($row))) continue; // skip empty lines

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
}
