<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property int $student_id
 * @property \Illuminate\Support\Carbon|null $attendance_date
 * @property \Illuminate\Support\Carbon|null $check_in_time
 * @property float|null $latitude
 * @property float|null $longitude
 * @property string|null $photo_url
 * @property string $status
 * @property \App\Models\Student|null $student
 * @property \Illuminate\Support\Carbon|null $created_at
 */
class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'attendance_date' => $this->attendance_date?->toDateString(),
            'check_in_time' => $this->check_in_time?->format('H:i:s'),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'photo_url' => $this->photo_url,
            'status' => $this->status,
            'student' => $this->whenLoaded('student', fn () => new StudentResource($this->student)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
