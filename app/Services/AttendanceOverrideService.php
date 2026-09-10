<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceOverride;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

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
                'original_status' => $override ? ($override->original_status ?? 'Absent') : ($att->status ?? 'Absent'),
                'overridden_status' => $override->new_status ?? null,
                'current_status' => $att->status ?? $override->new_status ?? 'Absent',
                'override_id' => $override?->id,
                'override_reason' => $override?->reason,
                'check_in_time' => $att?->check_in_time,
            ];
        })->toArray();
    }

    public function override(int $studentId, int $userId, string $date, string $newStatus, string $reason): AttendanceOverride
    {
        return DB::transaction(function () use ($studentId, $userId, $date, $newStatus, $reason) {
            $existing = AttendanceOverride::where('student_id', $studentId)
                ->where('attendance_date', $date)
                ->first();

            $att = Attendance::where('student_id', $studentId)
                ->whereDate('attendance_date', $date)
                ->first();

            $originalStatus = $existing ? ($existing->original_status ?? $att?->status) : $att?->status;

            $data = [
                'student_id' => $studentId,
                'user_id' => $userId,
                'attendance_date' => $date,
                'original_status' => $originalStatus,
                'new_status' => $newStatus,
                'reason' => $reason,
            ];

            if ($existing) {
                $existing->update($data);
                $override = $existing->fresh();
            } else {
                $override = AttendanceOverride::create($data);
            }

            if ($att) {
                $att->update(['status' => $newStatus]);
            } else {
                Attendance::create([
                    'student_id' => $studentId,
                    'attendance_date' => $date,
                    'check_in_time' => now()->format('H:i:s'),
                    'latitude' => '0.000000',
                    'longitude' => '0.000000',
                    'photo_url' => '',
                    'status' => $newStatus,
                ]);
            }

            return $override;
        });
    }

    public function deleteOverride(int $overrideId): void
    {
        DB::transaction(function () use ($overrideId) {
            $override = AttendanceOverride::find($overrideId);
            if (! $override) {
                return;
            }

            $att = Attendance::where('student_id', $override->student_id)
                ->whereDate('attendance_date', $override->attendance_date)
                ->first();

            if ($att) {
                if ($override->original_status !== null) {
                    $att->update(['status' => $override->original_status]);
                } else {
                    $att->delete();
                }
            }

            $override->delete();
        });
    }
}
