<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlotSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'siswa_ids' => ['required', 'array', 'min:1'],
            'siswa_ids.*' => ['required', 'integer', 'exists:siswa,id'],
            'tanggal_masuk' => ['nullable', 'date'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'siswa_ids.required' => 'Pilih minimal satu siswa untuk dimasukkan ke rombel.',
            'siswa_ids.min' => 'Pilih minimal satu siswa untuk dimasukkan ke rombel.',
            'siswa_ids.*.exists' => 'Data siswa yang dipilih tidak ditemukan.',
        ];
    }
}
