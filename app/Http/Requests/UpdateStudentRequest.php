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
        $id = $this->route('student');

        return [
            'nis' => ['required', 'string', 'max:30', Rule::unique('students', 'nis')->ignore($id)],
            'nisn' => ['required', 'string', 'max:30', Rule::unique('students', 'nisn')->ignore($id)],
            'name' => 'required|string|max:100',
            'class_id' => 'required|exists:school_classes,id',
            'birth_date' => 'required|date',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'enrollment_year' => 'required|integer|min:2000|max:2099',
            'guardian_id' => 'nullable|exists:guardians,id',
            'status' => 'required|in:Active,Inactive',
        ];
    }
}
