<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class LeaveRequestData
{
    public int $id;
    public int $student_id;
    public ?int $guardian_id;
    public string $category;
    public string $start_date;
    public string $end_date;
    public ?string $description;
    public ?string $document_url;
    public string $approval_status;
    public ?StudentData $student;
    public ?GuardianData $guardian;
    public ?string $created_at;
    public ?string $updated_at;
}
