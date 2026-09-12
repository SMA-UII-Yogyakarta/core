<?php

namespace App\Http\Requests;

use App\Models\SchoolClass;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSchoolClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = trim((string) $this->input('name'));
        $level = trim((string) ($this->input('level') ?: 'X'));

        if ($name !== '' && $level !== '') {
            $cleaned = (string) preg_replace('/^(Kelas\s*)?' . preg_quote($level, '/') . '[\s\-_]*/i', '', $name);
            $this->merge([
                'name' => $cleaned !== '' ? $cleaned : $name,
                'level' => $level,
            ]);
        }
    }

    public function rules(): array
    {
        $academicYear = $this->input('academic_year') ?: SchoolClass::currentAcademicYear();

        return [
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('school_classes')->where(fn ($q) => $q->where('academic_year', $academicYear)),
            ],
            'level' => 'nullable|string|in:X,XI,XII',
            'academic_year' => 'nullable|string|max:20',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kelas rombel wajib diisi.',
            'name.unique' => 'Nama kelas ini sudah digunakan pada tahun ajaran yang sama.',
            'level.in' => 'Tingkat kelas harus salah satu dari: X, XI, atau XII.',
            'capacity.min' => 'Kapasitas kelas minimal 1 siswa.',
            'capacity.max' => 'Kapasitas kelas maksimal 100 siswa.',
            'teacher_id.exists' => 'Wali kelas yang dipilih tidak valid.',
        ];
    }
}
