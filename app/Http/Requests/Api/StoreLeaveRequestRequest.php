<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|integer|exists:students,id',
            'guardian_id' => 'nullable|integer|exists:guardians,id',
            'category' => 'required|string|in:Sick,Permission,Other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'document_url' => 'nullable|string',
        ];
    }
}
