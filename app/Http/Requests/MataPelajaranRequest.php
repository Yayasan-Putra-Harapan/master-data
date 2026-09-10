<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MataPelajaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('mata_pelajaran')
            ? ($this->route('mata_pelajaran') instanceof \App\Models\MataPelajaran ? $this->route('mata_pelajaran')->id : $this->route('mata_pelajaran'))
            : null;

        return [
            'kode_mapel' => ['required', 'string', 'max:30', Rule::unique('mata_pelajaran', 'kode_mapel')->ignore($id)],
            'nama_mapel' => ['required', 'string', 'max:100'],
            'unit_id' => ['required', 'exists:units,id'],
            'kelompok' => ['required', Rule::in(['wajib', 'peminatan', 'muatan_lokal', 'ekstrakurikuler'])],
            'beban_jam' => ['required', 'integer', 'between:1,10'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_mapel.required' => 'Kode mata pelajaran wajib diisi.',
            'kode_mapel.unique' => 'Kode mata pelajaran sudah digunakan.',
            'unit_id.exists' => 'Unit pendidikan yang dipilih tidak ditemukan.',
        ];
    }
}
