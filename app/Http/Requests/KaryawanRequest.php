<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class KaryawanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $karyawanId = $this->route('karyawan') ? ($this->route('karyawan') instanceof \App\Models\Karyawan ? $this->route('karyawan')->id : $this->route('karyawan')) : null;

        return [
            'nip' => ['nullable', 'string', 'max:30', \Illuminate\Validation\Rule::unique('karyawan', 'nip')->ignore($karyawanId)],
            'nuptk' => ['nullable', 'digits:16', \Illuminate\Validation\Rule::unique('karyawan', 'nuptk')->ignore($karyawanId)],
            'nik' => ['required', 'digits:16', \Illuminate\Validation\Rule::unique('karyawan', 'nik')->ignore($karyawanId)],
            'nama' => ['required', 'string', 'max:100'],
            'jenis_kelamin' => ['required', \Illuminate\Validation\Rule::in(['L', 'P'])],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['required', 'date', 'before_or_equal:-17 years'],
            'unit_id' => ['required', 'exists:units,id'],
            'role' => ['required', \Illuminate\Validation\Rule::in(['guru', 'staf', 'kepala_sekolah', 'keuangan', 'administrasi'])],
            'status_kepegawaian' => ['required', \Illuminate\Validation\Rule::in(['tetap', 'kontrak', 'honorer'])],
            'telepon' => ['required', 'string', 'regex:/^(\+62|62|0)[0-9]{8,15}$/'],
            'email' => ['required', 'email', 'max:100', \Illuminate\Validation\Rule::unique('karyawan', 'email')->ignore($karyawanId)],
            'alamat' => ['nullable', 'string', 'max:500'],
            'pendidikan_terakhir' => ['nullable', 'string', 'max:50'],
            'tanggal_masuk' => ['required', 'date'],
            'is_aktif' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nik.required' => 'NIK wajib diisi untuk integritas data karyawan.',
            'nik.digits' => 'NIK harus tepat 16 digit angka.',
            'nik.unique' => 'NIK sudah terdaftar pada karyawan lain.',
            'nuptk.digits' => 'NUPTK harus 16 digit angka.',
            'email.unique' => 'Alamat email sudah terdaftar.',
            'unit_id.exists' => 'Unit sekolah yang dipilih tidak valid atau tidak ditemukan.',
            'tanggal_lahir.before_or_equal' => 'Usia karyawan minimal harus 17 tahun.',
            'telepon.regex' => 'Format nomor telepon tidak valid (contoh: 081234567890).',
        ];
    }
}
