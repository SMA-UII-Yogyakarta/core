<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nis' => 'required|string|max:30|unique:students,nis',
            'nisn' => 'required|string|max:30|unique:students,nisn',
            'name' => 'required|string|max:100',
            'class_id' => 'required|exists:school_classes,id',
            'birth_date' => 'required|date',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'enrollment_year' => 'required|integer|min:2000|max:2099',
            'guardian_id' => 'nullable|exists:guardians,id',
            'email' => 'nullable|email|max:100|unique:users,email',
            'password' => 'nullable|string|min:6',
        ];
    }
}
