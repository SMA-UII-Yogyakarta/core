<?php

namespace App\Http\Requests;

use App\Models\Guardian;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuardianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'email' => ['nullable', 'email', 'max:100', Rule::unique('users', 'email')->ignore($this->currentGuardian()?->user_id)],
            'password' => 'nullable|string|min:6',
        ];
    }

    private function currentGuardian(): ?Guardian
    {
        $guardian = $this->route('guardian');

        if ($guardian instanceof Guardian) {
            return $guardian;
        }

        $id = $this->route('id');

        return $id ? Guardian::find($id) : null;
    }
}
