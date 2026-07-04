<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreAcademicCalendarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'holiday_date' => 'required|date',
            'description' => 'nullable|string|max:255',
            'is_holiday' => 'boolean',
        ];
    }
}
