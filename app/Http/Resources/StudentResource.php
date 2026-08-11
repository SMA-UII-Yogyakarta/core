<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $nis
 * @property string $nisn
 * @property string $name
 * @property string $birth_date
 * @property string|null $phone
 * @property string|null $address
 * @property int $enrollment_year
 * @property string $status
 * @property \App\Models\SchoolClass|null $class
 * @property \App\Models\Guardian|null $guardian
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nis' => $this->nis,
            'nisn' => $this->nisn,
            'name' => $this->name,
            'birth_date' => $this->birth_date,
            'phone' => $this->phone,
            'address' => $this->address,
            'enrollment_year' => $this->enrollment_year,
            'status' => $this->status,
            'class' => $this->whenLoaded('class', fn () => [
                'id' => $this->class->id,
                'name' => $this->class->name,
                'level' => $this->class->level,
            ]),
            'guardian' => $this->whenLoaded('guardian', fn () => [
                'id' => $this->guardian->id,
                'name' => $this->guardian->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
