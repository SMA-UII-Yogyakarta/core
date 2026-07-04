<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateAttendanceTimeSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings' => 'required|array',
            'settings.*.day' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'settings.*.check_in_open' => 'required|date_format:H:i',
            'settings.*.late_threshold' => 'required|date_format:H:i',
            'settings.*.check_in_close' => 'required|date_format:H:i',
        ];
    }
}
