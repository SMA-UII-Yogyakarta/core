<?php

namespace App\Http\Requests;

use App\Models\Teacher;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('teacher');
        $teacher = Teacher::find($id);
        $userId = $teacher?->user_id;

        return [
            'teacher_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('teachers', 'teacher_code')->ignore($id),
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'name' => 'required|string|max:100',
            'email' => [
                'nullable',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($userId),
            ],
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
