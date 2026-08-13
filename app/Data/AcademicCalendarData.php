<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class AcademicCalendarData
{
    public int $id;
    public string $holiday_date;
    public ?string $description;
    public bool $is_holiday;
    public ?string $created_at;
    public ?string $updated_at;
}
