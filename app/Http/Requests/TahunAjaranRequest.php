<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TahunAjaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('tahun_ajaran')
            ? ($this->route('tahun_ajaran') instanceof \App\Models\TahunAjaran ? $this->route('tahun_ajaran')->id : $this->route('tahun_ajaran'))
            : null;

        return [
            'kode' => ['required', 'string', 'max:25', Rule::unique('tahun_ajaran', 'kode')->ignore($id)],
            'nama' => ['required', 'string', 'max:100'],
            'semester' => ['required', Rule::in(['ganjil', 'genap'])],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after:tanggal_mulai'],
            'is_aktif' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode.required' => 'Kode tahun ajaran wajib diisi.',
            'kode.unique' => 'Kode tahun ajaran sudah digunakan.',
            'tanggal_selesai.after' => 'Tanggal selesai harus setelah tanggal mulai.',
        ];
    }
}
