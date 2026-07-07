<?php

namespace App\Services;

use App\Events\AttendanceCreated;
use App\Events\AttendanceMarked;
use App\Models\AcademicCalendar;
use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
use App\Models\LeaveRequest;
use App\Models\Student;
use App\Services\StorageService;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;

class AttendanceService
{
    public function __construct(
        protected StorageService $storageService,
    ) {
    }

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

        // ─── Layer 1: Academic Calendar Check ───
        $holiday = AcademicCalendar::whereDate('holiday_date', $today)
            ->where('is_holiday', true)
            ->first();

        if ($holiday) {
            throw new \RuntimeException('Today is a holiday: ' . $holiday->description);
        }

        // ─── Layer 2: Active Day Check ───
        $dayName = now()->format('l');
        $setting = AttendanceTimeSetting::where('day', $dayName)->first();

        if (! $setting) {
            throw new \RuntimeException('No attendance schedule for ' . $dayName);
        }

        // ─── Layer 3: Time Range Check ───
        $currentTime = $now->format('H:i:s');
        $openTime = $setting->check_in_open->format('H:i:s');
        $lateTime = $setting->late_threshold->format('H:i:s');
        $closeTime = $setting->check_in_close->format('H:i:s');

        if ($currentTime < $openTime) {
            throw new \RuntimeException('Attendance opens at ' . $openTime);
        }

        $status = 'Present';
        if ($currentTime > $lateTime) {
            $status = 'Late';
        }

        if ($currentTime > $closeTime) {
            throw new \RuntimeException('Attendance closed at ' . $closeTime);
        }

        // Check if already checked in today
        $existing = Attendance::where('student_id', $studentId)
            ->whereDate('attendance_date', $today)
            ->first();

        if ($existing) {
            throw new \RuntimeException('Already checked in today.');
        }

        $photoUrl = $data['photo_url'] ?? '';

        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $photoUrl = $this->storageService->uploadAttendancePhoto($data['photo'], $studentId);
        } elseif (empty($photoUrl) && isset($data['photo_blob'])) {
            $tempPath = tempnam(sys_get_temp_dir(), 'attendance_') . '.jpg';
            file_put_contents($tempPath, base64_decode($data['photo_blob']));
            $uploadedFile = new UploadedFile($tempPath, 'photo.jpg', 'image/jpeg', null, true);
            $photoUrl = $this->storageService->uploadAttendancePhoto($uploadedFile, $studentId);
        }

        $attendance = Attendance::create([
            'student_id' => $studentId,
            'attendance_date' => $today,
            'check_in_time' => $now->format('H:i:s'),
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'photo_url' => $photoUrl,
            'status' => $status,
        ]);

        AttendanceCreated::dispatch($attendance);
        AttendanceMarked::dispatch($attendance);

        return $attendance;
    }

    public function todayByStudent(int $studentId): ?Attendance
    {
        return Attendance::where('student_id', $studentId)
            ->whereDate('attendance_date', now()->toDateString())
            ->first();
    }

    public function getStudentStats(int $studentId, ?int $month = null, ?int $year = null): array
    {
        $query = Attendance::where('student_id', $studentId);
        $presentQuery = Attendance::where('student_id', $studentId)->where('status', 'Present');
        $lateQuery = Attendance::where('student_id', $studentId)->where('status', 'Late');

        if ($month) {
            $query->whereMonth('attendance_date', $month);
            $presentQuery->whereMonth('attendance_date', $month);
            $lateQuery->whereMonth('attendance_date', $month);
        }
        if ($year) {
            $query->whereYear('attendance_date', $year);
            $presentQuery->whereYear('attendance_date', $year);
            $lateQuery->whereYear('attendance_date', $year);
        }

        $total = $query->count();
        $present = $presentQuery->count();
        $late = $lateQuery->count();

        return [
            'total_days' => $total,
            'present' => $present,
            'late' => $late,
            'absent' => max(0, $total - $present - $late),
        ];
    }

    public function history(int $studentId, int $perPage = 20, ?int $month = null, ?int $year = null): LengthAwarePaginator
    {
        return Attendance::where('student_id', $studentId)
            ->when($month, fn ($q, $v) => $q->whereMonth('attendance_date', $v))
            ->when($year, fn ($q, $v) => $q->whereYear('attendance_date', $v))
            ->latest('attendance_date')
            ->paginate($perPage);
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

        $sickCount = LeaveRequest::where('approval_status', 'Approved')
            ->where('category', 'Sick')
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->whereHas('student', fn ($q) => $q->where('class_id', $classId))
            ->count();

        return [
            'total' => $students,
            'present' => $attendances->where('status', 'Present')->count(),
            'late' => $attendances->where('status', 'Late')->count(),
            'absent' => $students - $attendances->count(),
            'sick_permission' => $sickCount,
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
                'date' => $date,
                'present' => $present,
                'late' => $late,
                'absent' => max(0, $absent),
            ];

            $totalPresent += $present;
            $totalLate += $late;
            $totalAbsent += max(0, $absent);
        }

        return [
            'days' => $days,
            'summary' => [
                'total_students' => $students,
                'total_present' => $totalPresent,
                'total_late' => $totalLate,
                'total_absent' => $totalAbsent,
                'total_days' => count($days),
            ],
        ];
    }
}
