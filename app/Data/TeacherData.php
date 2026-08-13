<?php

namespace App\Data;

use App\Enums\TeacherType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TeacherData
{
    public int $id;
    public ?int $user_id;
    public string $teacher_code;
    public string $name;
    public ?string $phone;
    public ?TeacherType $teacher_type;
    public ?UserData $user;
    public ?string $created_at;
    public ?string $updated_at;
}
