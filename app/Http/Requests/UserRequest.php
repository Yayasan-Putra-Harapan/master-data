<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperadmin() ?? false;
    }

    public function rules(): array
    {
        $userId = $this->route('user')
            ? ($this->route('user') instanceof \App\Models\User ? $this->route('user')->id : $this->route('user'))
            : null;

        $passwordRules = $userId
            ? ['nullable', 'string', Password::defaults()]
            : ['required', 'string', Password::defaults()];

        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:100', Rule::unique('users', 'email')->ignore($userId)],
            'role' => ['required', Rule::in(['superadmin', 'operator'])],
            'unit_id' => [
                'nullable',
                Rule::requiredIf($this->input('role') === 'operator'),
                'exists:units,id',
            ],
            'password' => $passwordRules,
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama pengguna wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar pada akun lain.',
            'role.required' => 'Peran / hak akses pengguna wajib dipilih.',
            'unit_id.required' => 'Operator unit wajib memilih satuan pendidikan penempatan.',
            'unit_id.exists' => 'Satuan pendidikan yang dipilih tidak valid.',
            'password.required' => 'Kata sandi wajib diisi untuk pengguna baru.',
        ];
    }
}
