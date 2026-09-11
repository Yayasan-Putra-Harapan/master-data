<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BangunanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) {
            return true;
        }

        if ($user->isSuperadmin()) {
            return true;
        }

        $bangunan = $this->route('bangunan');
        if ($bangunan) {
            $bangunanModel = $bangunan instanceof \App\Models\Bangunan ? $bangunan : \App\Models\Bangunan::find($bangunan);
            if ($bangunanModel && !$user->canAccessUnit($bangunanModel->unit_id)) {
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
        $id = $this->route('bangunan')
            ? ($this->route('bangunan') instanceof \App\Models\Bangunan ? $this->route('bangunan')->id : $this->route('bangunan'))
            : null;

        return [
            'kode_bangunan' => ['required', 'string', 'max:30', Rule::unique('bangunan', 'kode_bangunan')->ignore($id)],
            'nama_bangunan' => ['required', 'string', 'max:100'],
            'unit_id' => ['required', 'exists:units,id'],
            'jumlah_lantai' => ['required', 'integer', 'between:1,10'],
            'luas' => ['nullable', 'numeric', 'min:0'],
            'kondisi' => ['required', Rule::in(['baik', 'rusak_ringan', 'rusak_berat'])],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_bangunan.required' => 'Kode bangunan wajib diisi.',
            'kode_bangunan.unique' => 'Kode bangunan sudah digunakan.',
            'unit_id.exists' => 'Unit pendidikan yang dipilih tidak ditemukan.',
        ];
    }
}
