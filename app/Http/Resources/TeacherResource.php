<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $teacher_code
 * @property string $name
 * @property \Illuminate\Support\Collection<int, \App\Enums\TeacherType>|null $teacher_type
 * @property \Illuminate\Database\Eloquent\Collection<int, \App\Models\SchoolClass> $schoolClasses
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'teacher_code' => $this->teacher_code,
            'name' => $this->name,
            'teacher_type' => $this->teacher_type?->map(fn ($t) => $t->value)->values() ?? [],
            'school_classes' => $this->whenLoaded('schoolClasses', fn () => $this->schoolClasses->map(
                fn ($class) => ['id' => $class->id, 'name' => $class->name],
            )),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
