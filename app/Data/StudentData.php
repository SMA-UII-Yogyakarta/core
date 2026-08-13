<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class StudentData
{
    public int $id;
    public ?int $user_id;
    public ?int $class_id;
    public string $nis;
    public string $nisn;
    public string $name;
    public ?string $birth_date;
    public ?string $phone;
    public ?string $address;
    public int $enrollment_year;
    public string $status;
    public ?int $guardian_id;
    public ?SchoolClassData $class;
    public ?GuardianData $guardian;
    public ?UserData $user;
    public ?string $created_at;
    public ?string $updated_at;
}
