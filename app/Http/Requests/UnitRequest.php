<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UnitRequest extends FormRequest
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
        $unitId = $this->route('unit') ? ($this->route('unit') instanceof \App\Models\Unit ? $this->route('unit')->id : $this->route('unit')) : null;

        return [
            'kode_unit' => ['required', 'string', 'max:20', 'uppercase', \Illuminate\Validation\Rule::unique('units', 'kode_unit')->ignore($unitId)],
            'nama_unit' => ['required', 'string', 'max:100'],
            'jenjang' => ['required', \Illuminate\Validation\Rule::in(['PG', 'TK', 'SD', 'SMP', 'SMA', 'BOARDING'])],
            'alamat' => ['nullable', 'string', 'max:500'],
            'telepon' => ['nullable', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:100'],
            'kepala_sekolah' => ['nullable', 'string', 'max:100'],
            'is_aktif' => ['boolean'],
        ];
    }
}
