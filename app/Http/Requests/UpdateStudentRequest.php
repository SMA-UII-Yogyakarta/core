<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('student');

        return [
            'nis' => ['required', 'string', 'max:30', Rule::unique('students', 'nis')->ignore($id)],
            'nisn' => ['required', 'string', 'max:30', Rule::unique('students', 'nisn')->ignore($id)],
            'name' => 'required|string|max:100',
            'class_id' => 'nullable|exists:school_classes,id',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'enrollment_year' => 'required|integer|min:2000|max:2099',
            'guardian_id' => 'nullable|exists:guardians,id',
            'status' => 'required|in:Active,Inactive,Graduated,Transferred,Dropped',
            'email' => 'nullable|email|max:100',
            'password' => 'nullable|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'nis.required' => 'NIS siswa wajib diisi.',
            'nis.unique' => 'NIS ini sudah terdaftar untuk siswa lain.',
            'nisn.required' => 'NISN siswa wajib diisi.',
            'nisn.unique' => 'NISN ini sudah terdaftar untuk siswa lain.',
            'name.required' => 'Nama lengkap siswa wajib diisi.',
            'class_id.exists' => 'Kelas yang dipilih tidak valid.',
            'status.in' => 'Status siswa harus salah satu dari: Aktif, Lulus, Pindah, atau Keluar.',
            'password.min' => 'Password minimal 6 karakter.',
        ];
    }
}
