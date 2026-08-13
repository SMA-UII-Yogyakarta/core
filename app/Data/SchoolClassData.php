<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class SchoolClassData
{
    public int $id;
    public string $name;
    public string $level;
    public int $capacity;
    public ?int $teacher_id;
    public ?TeacherData $teacher;
    public ?int $students_count;
    public ?string $created_at;
    public ?string $updated_at;
}
