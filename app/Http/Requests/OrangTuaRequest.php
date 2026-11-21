<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class OrangTuaRequest extends FormRequest
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
        $isUpdate = (bool) $this->route('orang_tua');
        $orangTuaId = $this->route('orang_tua') instanceof \App\Models\OrangTua
            ? $this->route('orang_tua')->id
            : $this->route('orang_tua');

        return [
            'no_kk' => ['nullable', 'digits:16'],
            'nik_ayah' => ['nullable', 'digits:16'],
            'nama_ayah' => ['nullable', 'string', 'max:100'],
            'pekerjaan_ayah' => ['nullable', 'string', 'max:100'],
            'penghasilan_ayah' => ['nullable', 'string', 'max:50'],
            'nik_ibu' => ['nullable', 'digits:16'],
            'nama_ibu' => ['nullable', 'string', 'max:100'],
            'pekerjaan_ibu' => ['nullable', 'string', 'max:100'],
            'penghasilan_ibu' => ['nullable', 'string', 'max:50'],
            'nama_wali' => ['nullable', 'string', 'max:100'],
            'nik_wali' => ['nullable', 'digits:16'],
            'hubungan_wali' => ['nullable', 'string', 'max:50'],
            'telepon' => ['required', 'string', 'regex:/^(\+62|62|0)[0-9]{8,15}$/'],
            'email' => ['required', 'email', 'max:100', \Illuminate\Validation\Rule::unique('users', 'email')->ignore(
                $orangTuaId ? \App\Models\User::where('orang_tua_id', $orangTuaId)->value('id') : null
            )],
            'username' => ['nullable', 'string', 'max:50', \Illuminate\Validation\Rule::unique('users', 'username')->ignore(
                $orangTuaId ? \App\Models\User::where('orang_tua_id', $orangTuaId)->value('id') : null
            )],
            'password' => $isUpdate ? ['nullable', 'string', 'min:6'] : ['required', 'string', 'min:6'],
            'alamat' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'no_kk.digits' => 'Nomor KK harus 16 digit angka.',
            'nik_ayah.digits' => 'NIK Ayah harus 16 digit angka.',
            'nik_ibu.digits' => 'NIK Ibu harus 16 digit angka.',
            'nik_wali.digits' => 'NIK Wali harus 16 digit angka.',
            'telepon.required' => 'Nomor telepon wajib diisi untuk kontak darurat/wali.',
            'telepon.regex' => 'Format nomor telepon tidak valid (contoh: 081234567890).',
            'email.required' => 'Alamat email orang tua/wali wajib diisi untuk akun login.',
            'email.unique' => 'Email ini sudah dipakai akun pengguna lain.',
            'username.unique' => 'Username ini sudah dipakai akun pengguna lain.',
            'password.required' => 'Kata sandi akun orang tua/wali wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'alamat.required' => 'Alamat tempat tinggal wajib diisi.',
        ];
    }
}
