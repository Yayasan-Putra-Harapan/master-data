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
            'email' => ['nullable', 'email', 'max:100'],
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
            'alamat.required' => 'Alamat tempat tinggal wajib diisi.',
        ];
    }
}
