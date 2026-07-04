<?php

namespace App\Services;

use App\Events\AttendanceCreated;
use App\Models\AcademicCalendar;
use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class AttendanceService
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Attendance::query()
            ->with(['student.user', 'student.class'])
            ->when($filters['student_id'] ?? null, fn ($q, $v) => $q->where('student_id', $v))
            ->when($filters['class_id'] ?? null, fn ($q, $v) => $q->whereHas('student', fn ($sq) => $sq->where('class_id', $v)))
            ->when($filters['date'] ?? null, fn ($q, $v) => $q->whereDate('attendance_date', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->latest('attendance_date')
            ->paginate($perPage);
    }

    public function todayByClass(int $classId): array
    {
        $today = now()->toDateString();

        $students = Student::with('user')
            ->where('class_id', $classId)
            ->where('status', 'Active')
            ->get();

        $attendances = Attendance::whereDate('attendance_date', $today)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $results = [];
        foreach ($students as $student) {
            $att = $attendances->get($student->id);
            $results[] = [
                'student' => $student,
                'attendance' => $att,
                'status' => $att?->status ?? 'Absent',
            ];
        }

        return $results;
    }

    public function checkIn(int $studentId, array $data): Attendance
    {
        $today = now()->toDateString();
        $now = now();

        // Check if already checked in today
        $existing = Attendance::where('student_id', $studentId)
            ->whereDate('attendance_date', $today)
            ->first();

        if ($existing) {
            throw new \RuntimeException('Sudah melakukan presensi hari ini.');
        }

        // Check academic calendar
        $holiday = AcademicCalendar::where('holiday_date', $today)
            ->where('is_holiday', true)
            ->first();

        if ($holiday) {
            throw new \RuntimeException('Hari ini adalah hari libur: ' . $holiday->description);
        }

        // Check attendance time settings
        $dayName = now()->format('l');
        $setting = AttendanceTimeSetting::where('day', $dayName)->first();

        $status = 'Present';
        if ($setting && $now->gt(Carbon::parse($setting->late_threshold))) {
            $status = 'Late';
        }

        $attendance = Attendance::create([
            'student_id' => $studentId,
            'attendance_date' => $today,
            'check_in_time' => $now->format('H:i:s'),
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'photo_url' => $data['photo_url'] ?? '',
            'status' => $status,
        ]);

        // Broadcast event for real-time monitoring
        AttendanceCreated::dispatch($attendance);

        return $attendance;
    }

    public function history(int $studentId, int $limit = 30): array
    {
        return Attendance::where('student_id', $studentId)
            ->latest('attendance_date')
            ->take($limit)
            ->get()
            ->toArray();
    }

    public function stats(int $classId, ?string $date = null): array
    {
        $date = $date ?? now()->toDateString();

        $students = Student::where('class_id', $classId)
            ->where('status', 'Active')
            ->count();

        $attendances = Attendance::whereDate('attendance_date', $date)
            ->whereHas('student', fn ($q) => $q->where('class_id', $classId))
            ->get();

        return [
            'total' => $students,
            'present' => $attendances->where('status', 'Present')->count(),
            'late' => $attendances->where('status', 'Late')->count(),
            'absent' => $students - $attendances->count(),
            'sick_permission' => 0, // via leave_requests
        ];
    }

    public function getMonthlyDaily(int $classId, int $month, int $year): array
    {
        $students = Student::where('class_id', $classId)
            ->where('status', 'Active')
            ->count();

        $attendances = Attendance::whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->whereHas('student', fn ($q) => $q->where('class_id', $classId))
            ->get()
            ->groupBy('attendance_date');

        $days = [];
        $totalPresent = 0;
        $totalLate = 0;
        $totalAbsent = 0;

        foreach ($attendances as $date => $items) {
            $present = $items->where('status', 'Present')->count();
            $late = $items->where('status', 'Late')->count();
            $absent = $students - $items->count();

            $days[] = [
                'tanggal' => $date,
                'hadir' => $present,
                'terlambat' => $late,
                'alpa' => max(0, $absent),
            ];

            $totalPresent += $present;
            $totalLate += $late;
            $totalAbsent += max(0, $absent);
        }

        return [
            'days' => $days,
            'summary' => [
                'total_siswa' => $students,
                'total_hadir' => $totalPresent,
                'total_terlambat' => $totalLate,
                'total_alpa' => $totalAbsent,
                'jumlah_hari' => count($days),
            ],
        ];
    }
}
