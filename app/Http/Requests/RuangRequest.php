<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RuangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('ruang')
            ? ($this->route('ruang') instanceof \App\Models\Ruang ? $this->route('ruang')->id : $this->route('ruang'))
            : null;

        return [
            'kode_ruang' => ['required', 'string', 'max:30', Rule::unique('ruang', 'kode_ruang')->ignore($id)],
            'nama_ruang' => ['required', 'string', 'max:100'],
            'bangunan_id' => ['required', 'exists:bangunan,id'],
            'lantai' => ['required', 'integer', 'between:1,10'],
            'fungsi' => ['required', Rule::in(['kelas', 'laboratorium', 'perpustakaan', 'kantor', 'aula', 'ibadah', 'lainnya'])],
            'kapasitas' => ['required', 'integer', 'between:1,500'],
            'kondisi' => ['required', Rule::in(['baik', 'rusak_ringan', 'rusak_berat'])],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_ruang.required' => 'Kode ruangan wajib diisi.',
            'kode_ruang.unique' => 'Kode ruangan sudah digunakan.',
            'bangunan_id.exists' => 'Bangunan/gedung yang dipilih tidak ditemukan.',
        ];
    }
}
