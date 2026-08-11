<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property int $student_id
 * @property int $guardian_id
 * @property string $category
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property string|null $document_url
 * @property string $approval_status
 * @property \App\Models\Student|null $student
 * @property \App\Models\Guardian|null $guardian
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class LeaveRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'guardian_id' => $this->guardian_id,
            'category' => $this->category,
            'description' => $this->description,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'document_url' => $this->document_url,
            'approval_status' => $this->approval_status,
            'student' => $this->whenLoaded('student', fn () => new StudentResource($this->student)),
            'guardian' => $this->whenLoaded('guardian', fn () => new GuardianResource($this->guardian)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
