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
            'teacher_code' => 'required|string|max:20|unique:teachers,teacher_code',
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100|unique:users,email',
            'password' => 'nullable|string|min:6',
        ];
    }
}
