<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teacher_code' => 'required|string|max:20|unique:teachers,teacher_code|unique:users,username',
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100|unique:users,email',
            'teacher_type' => 'nullable',
            'password' => 'nullable|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'teacher_code.required' => 'Kode guru / NIP wajib diisi.',
            'teacher_code.max' => 'Kode guru / NIP maksimal 20 karakter.',
            'teacher_code.unique' => 'Kode guru atau username ini sudah terdaftar di sistem.',
            'name.required' => 'Nama lengkap guru wajib diisi.',
            'name.max' => 'Nama lengkap guru maksimal 100 karakter.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal 100 karakter.',
            'email.unique' => 'Email ini sudah terdaftar untuk akun lain.',
            'password.min' => 'Password minimal 6 karakter.',
        ];
    }
}
