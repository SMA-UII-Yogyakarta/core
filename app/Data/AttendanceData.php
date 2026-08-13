<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class AttendanceData
{
    public int $id;
    public int $student_id;
    public string $date;
    public string $status;
    public ?string $check_in_time;
    public ?string $photo_url;
    public ?float $latitude;
    public ?float $longitude;
    public ?StudentData $student;
    public ?string $created_at;
    public ?string $updated_at;
}
