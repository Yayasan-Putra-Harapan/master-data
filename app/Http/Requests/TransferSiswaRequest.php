<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_kelas_id' => ['required', 'integer', 'exists:kelas,id'],
            'siswa_ids' => ['required', 'array', 'min:1'],
            'siswa_ids.*' => ['required', 'integer', 'exists:siswa,id'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'target_kelas_id.required' => 'Pilih kelas tujuan pemindahan.',
            'target_kelas_id.exists' => 'Kelas tujuan tidak ditemukan.',
            'siswa_ids.required' => 'Pilih minimal satu siswa yang akan dipindahkan.',
            'siswa_ids.min' => 'Pilih minimal satu siswa yang akan dipindahkan.',
        ];
    }
}
