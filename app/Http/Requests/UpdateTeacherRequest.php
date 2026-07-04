<?php

namespace App\Http\Requests;

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
        $id = $this->route('teacher');
        return [
            'teacher_code' => ['required', 'string', 'max:20', Rule::unique('teachers', 'teacher_code')->ignore($id)],
            'name' => 'required|string|max:100',
        ];
    }
}
