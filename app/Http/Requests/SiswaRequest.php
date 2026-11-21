<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SiswaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) {
            return true;
        }

        if ($user->isSuperadmin()) {
            return true;
        }

        $siswa = $this->route('siswa');
        if ($siswa) {
            $siswaModel = $siswa instanceof \App\Models\Siswa ? $siswa : \App\Models\Siswa::find($siswa);
            if ($siswaModel && !$user->canAccessUnit($siswaModel->unit_id)) {
                return false;
            }
        }

        if ($this->has('unit_id') && !$user->canAccessUnit((int)$this->input('unit_id'))) {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        $siswaId = $this->route('siswa') ? ($this->route('siswa') instanceof \App\Models\Siswa ? $this->route('siswa')->id : $this->route('siswa')) : null;

        return [
            'nisn' => ['required', 'digits:10', \Illuminate\Validation\Rule::unique('siswa', 'nisn')->ignore($siswaId)],
            'nis' => ['nullable', 'string', 'max:20', \Illuminate\Validation\Rule::unique('siswa', 'nis')->ignore($siswaId)],
            'nik' => ['nullable', 'digits:16', \Illuminate\Validation\Rule::unique('siswa', 'nik')->ignore($siswaId)],
            'nama_lengkap' => ['required', 'string', 'max:150'],
            'nama_panggilan' => ['nullable', 'string', 'max:50'],
            'jenis_kelamin' => ['required', \Illuminate\Validation\Rule::in(['L', 'P'])],
            'tempat_lahir' => ['required', 'string', 'max:100'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
            'agama' => ['nullable', 'string', 'max:30'],
            'unit_id' => ['required', 'exists:units,id'],
            'orang_tua_id' => ['nullable', 'exists:orang_tua,id'],
            'alamat' => ['required', 'string', 'max:500'],
            'angkatan' => ['required', 'integer', 'between:2010,2035'],
            'status' => ['required', \Illuminate\Validation\Rule::in(['aktif', 'lulus', 'mutasi', 'keluar'])],
            'username' => ['nullable', 'string', 'max:50', 'alpha_dash', \Illuminate\Validation\Rule::unique('users', 'username')->ignore(
                $siswaId ? \App\Models\User::where('siswa_id', $siswaId)->value('id') : null
            )],
            'password' => ['nullable', 'string', 'min:6'],
            'foto' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'hapus_foto' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $unitId = $this->input('unit_id');
            $tanggalLahir = $this->input('tanggal_lahir');

            if ($unitId && $tanggalLahir) {
                $unit = \App\Models\Unit::find($unitId);
                if ($unit) {
                    $age = \Carbon\Carbon::parse($tanggalLahir)->age;
                    $minAge = match ($unit->jenjang) {
                        'PG' => 2,
                        'TK' => 3,
                        'SD' => 5,
                        'SMP' => 10,
                        'SMA' => 13,
                        'BOARDING' => 10,
                        default => 0,
                    };
                    $maxAge = match ($unit->jenjang) {
                        'PG' => 8,
                        'TK' => 10,
                        'SD' => 16,
                        'SMP' => 20,
                        'SMA' => 22,
                        'BOARDING' => 22,
                        default => 100,
                    };

                    if ($age < $minAge || $age > $maxAge) {
                        $validator->errors()->add(
                            'tanggal_lahir',
                            "Akurasi data: Usia siswa ({$age} tahun) tidak wajar untuk jenjang {$unit->jenjang} (harus antara {$minAge}-{$maxAge} tahun)."
                        );
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'nisn.required' => 'NISN wajib diisi.',
            'nisn.digits' => 'NISN harus tepat 10 digit angka valid.',
            'nisn.unique' => 'NISN sudah terdaftar pada siswa lain.',
            'unit_id.exists' => 'Unit sekolah yang dipilih tidak ditemukan.',
            'orang_tua_id.exists' => 'Data orang tua/wali tidak valid.',
            'alamat.required' => 'Alamat tinggal siswa wajib diisi.',
            'username.unique' => 'Username ini sudah dipakai akun pengguna lain.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'foto.image' => 'Berkas pas foto harus berupa gambar.',
            'foto.mimes' => 'Format pas foto harus berupa jpeg, jpg, png, atau webp.',
            'foto.max' => 'Ukuran pas foto maksimal 2MB.',
        ];
    }
}
