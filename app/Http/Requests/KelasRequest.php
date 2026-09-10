<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KelasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('kelas')
            ? ($this->route('kelas') instanceof \App\Models\Kelas ? $this->route('kelas')->id : $this->route('kelas'))
            : null;

        return [
            'kode_kelas' => ['required', 'string', 'max:30', Rule::unique('kelas', 'kode_kelas')->ignore($id)],
            'nama_kelas' => ['required', 'string', 'max:100'],
            'tingkat' => ['required', 'integer', 'between:1,12'],
            'unit_id' => ['required', 'exists:units,id'],
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajaran,id'],
            'wali_kelas_id' => ['nullable', 'exists:karyawan,id'],
            'kapasitas' => ['required', 'integer', 'between:1,60'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_kelas.required' => 'Kode kelas wajib diisi.',
            'kode_kelas.unique' => 'Kode kelas sudah digunakan.',
            'unit_id.exists' => 'Unit pendidikan yang dipilih tidak ditemukan.',
            'tahun_ajaran_id.exists' => 'Tahun ajaran tidak valid.',
            'wali_kelas_id.exists' => 'Wali kelas tidak valid.',
        ];
    }
}
