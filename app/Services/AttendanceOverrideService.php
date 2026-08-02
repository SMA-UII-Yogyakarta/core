<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceOverride;
use App\Models\Student;

class AttendanceOverrideService
{
    public function findByDate(?int $classId = null, ?string $date = null): array
    {
        $date = $date ?: now()->toDateString();

        $query = Student::with('class', 'user')->where('status', 'Active');

        if ($classId) {
            $query->where('class_id', $classId);
        }

        $students = $query->get();

        $attendances = Attendance::whereDate('attendance_date', $date)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $overrides = AttendanceOverride::whereIn('student_id', $students->pluck('id'))
            ->where('attendance_date', $date)
            ->get()
            ->keyBy('student_id');

        return $students->map(function ($s) use ($attendances, $overrides) {
            $att = $attendances->get($s->id);

            $override = $overrides->get($s->id);

            return [
                'id' => $s->id,
                'nis' => $s->nis,
                'name' => $s->name,
                'class' => $s->class->name ?? '-',
                'original_status' => $att->status ?? 'Absent',
                'overridden_status' => $override->new_status ?? null,
                'current_status' => $override->new_status ?? $att->status ?? 'Absent',
                'override_id' => $override?->id,
                'check_in_time' => $att?->check_in_time,
            ];
        })->toArray();
    }

    public function override(int $studentId, int $userId, string $date, string $newStatus, string $reason): AttendanceOverride
    {
        $existing = AttendanceOverride::where('student_id', $studentId)
            ->where('attendance_date', $date)->first();

        $att = Attendance::where('student_id', $studentId)
            ->whereDate('attendance_date', $date)->first();

        $data = [
            'student_id' => $studentId,
            'user_id' => $userId,
            'attendance_date' => $date,
            'original_status' => $att?->status,
            'new_status' => $newStatus,
            'reason' => $reason,
        ];

        if ($existing) {
            $existing->update($data);
            return $existing->fresh();
        }

        return AttendanceOverride::create($data);
    }

    public function deleteOverride(int $overrideId): void
    {
        AttendanceOverride::destroy($overrideId);
    }
}
