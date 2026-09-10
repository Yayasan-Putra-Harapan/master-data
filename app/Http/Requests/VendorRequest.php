<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VendorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('vendor')
            ? ($this->route('vendor') instanceof \App\Models\Vendor ? $this->route('vendor')->id : $this->route('vendor'))
            : null;

        return [
            'kode_vendor' => ['required', 'string', 'max:30', Rule::unique('vendor', 'kode_vendor')->ignore($id)],
            'nama_vendor' => ['required', 'string', 'max:100'],
            'kategori' => ['required', Rule::in(['sarana_prasarana', 'buku_pelajaran', 'katering', 'seragam', 'teknologi', 'kebersihan', 'lainnya'])],
            'nama_kontak' => ['nullable', 'string', 'max:100'],
            'telepon' => ['required', 'string', 'regex:/^(\+62|62|0)[0-9]{8,15}$/'],
            'email' => ['nullable', 'email', 'max:100'],
            'alamat' => ['nullable', 'string', 'max:500'],
            'status' => ['required', Rule::in(['aktif', 'non_aktif'])],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_vendor.required' => 'Kode vendor wajib diisi.',
            'kode_vendor.unique' => 'Kode vendor sudah digunakan.',
            'telepon.required' => 'Nomor kontak telepon vendor wajib diisi.',
            'telepon.regex' => 'Format nomor telepon tidak valid.',
        ];
    }
}
