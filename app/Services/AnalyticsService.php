<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AnalyticsService
{
    public function __construct(
        protected AttendanceService $attendanceService,
        protected AcademicCalendarService $calendarService,
    ) {
    }

    public function schoolOverview(?string $date = null): array
    {
        $date = $date ?? now()->toDateString();
        $classes = SchoolClass::all();

        $studentsByClass = Student::where('status', 'Active')
            ->get()
            ->groupBy('class_id');
        $total = $studentsByClass->flatten()->count();

        $attendances = Attendance::with('student')
            ->whereDate('attendance_date', $date)
            ->get();

        $present = $attendances->where('status', 'Present')->count();
        $late = $attendances->where('status', 'Late')->count();
        $sick = LeaveRequest::where('approval_status', 'Approved')
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->count();

        $hadirTerdata = $present + $late;

        $classStats = $classes->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'total' => $studentsByClass->get($c->id)?->count() ?? 0,
            'present' => $attendances->where('student.class_id', $c->id)->where('status', 'Present')->count(),
            'late' => $attendances->where('student.class_id', $c->id)->where('status', 'Late')->count(),
        ]);

        return [
            'date' => $date,
            'total_students' => $total,
            'verified_present' => $hadirTerdata,
            'present' => $present,
            'late' => $late,
            'sick_permission' => $sick,
            'absent' => max(0, $total - $hadirTerdata - $sick),
            'classes' => $classStats,
        ];
    }

    public function classDetail(int $classId, ?string $date = null): array
    {
        $date = $date ?? now()->toDateString();
        $class = SchoolClass::findOrFail($classId);

        $students = Student::with('user')
            ->where('class_id', $classId)
            ->where('status', 'Active')
            ->get();

        $attendances = Attendance::whereDate('attendance_date', $date)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $pendingLeaves = LeaveRequest::whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->where('approval_status', 'Pending')
            ->whereIn('student_id', $students->pluck('id'))
            ->get(['student_id', 'document_url'])
            ->keyBy('student_id');

        $approvedLeaves = LeaveRequest::whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->where('approval_status', 'Approved')
            ->whereIn('student_id', $students->pluck('id'))
            ->get(['student_id', 'category', 'document_url', 'description'])
            ->keyBy('student_id');

        $studentStats = $students->map(function ($s) use ($attendances, $pendingLeaves, $approvedLeaves, $date) {
            $attendance = $attendances->get($s->id);
            $statusMessage = null;

            if ($attendance) {
                $status = $attendance->status;
            } elseif ($pendingLeaves->has($s->id)) {
                $status = 'Pending';
            } elseif ($approvedLeaves->has($s->id)) {
                $status = $approvedLeaves->get($s->id)->category === 'Sick' ? 'Sick' : 'Permission';
            } else {
                if ($this->calendarService->isAlpaApplicable($date)) {
                    $status = 'Absent';
                } else {
                    $parsedDate = Carbon::parse($date);

                    if ($parsedDate->isFuture()) {
                        $status = 'NoUpdate';
                    } else {
                        $setting = AttendanceTimeSetting::where('day', $parsedDate->format('l'))->first();

                        if ($setting && now()->lessThan($setting->check_in_open)) {
                            $status = 'NotOpen';
                            $statusMessage = 'Dibuka pukul ' . Carbon::parse($setting->check_in_open)->format('H:i');
                        } else {
                            $status = 'NoCheckIn';
                        }
                    }
                }
            }

            return [
                'id' => $s->id,
                'name' => $s->name,
                'nis' => $s->nis,
                'status' => $status,
                'status_message' => $statusMessage,
                'check_in_time' => $attendance?->check_in_time?->format('H:i:s'),
                'photo_url' => $attendance?->photo_url,
                'document_url' => $status === 'Pending'
                    ? $pendingLeaves->get($s->id)?->document_url
                    : $approvedLeaves->get($s->id)?->document_url,
                'leave_reason' => in_array($status, ['Sick', 'Permission'])
                    ? $approvedLeaves->get($s->id)?->description
                    : null,
            ];
        });

        return [
            'class' => ['id' => $class->id, 'name' => $class->name],
            'date' => $date,
            'students' => $studentStats,
        ];
    }

    public function studentDetail(int $studentId, ?int $month = null, ?int $year = null): array
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        $student = Student::with(['user', 'class'])->findOrFail($studentId);

        $attendances = Attendance::where('student_id', $studentId)
            ->whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->orderBy('attendance_date')
            ->get();

        $daily = $attendances->map(fn ($a) => [
            'date' => $a->attendance_date->toDateString(),
            'status' => $a->status,
            'check_in_time' => $a->check_in_time,
        ]);

        $total = $attendances->count();
        $present = $attendances->where('status', 'Present')->count();
        $late = $attendances->where('status', 'Late')->count();

        $startOfMonth = now()->setDate($year, $month, 1)->startOfMonth();
        $endOfMonth = now()->setDate($year, $month, 1)->endOfMonth();
        $sickPermit = LeaveRequest::where('student_id', $studentId)
            ->whereDate('start_date', '<=', $endOfMonth)
            ->whereDate('end_date', '>=', $startOfMonth)
            ->whereIn('approval_status', ['Approved', 'Pending'])
            ->count();

        return [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'nis' => $student->nis,
                'class' => $student->class?->name,
            ],
            'month' => $month,
            'year' => $year,
            'stats' => [
                'total_days' => $total,
                'present' => $present,
                'late' => $late,
                'absent' => max(0, $total - $present - $late),
                'sick_permit' => $sickPermit,
                'attendance_percentage' => $total > 0 ? round(($present / $total) * 100, 1) : 0,
            ],
            'daily' => $daily,
        ];
    }

    public function monthlyTrend(?int $year = null): array
    {
        $year = $year ?? now()->year;
        return [
            'year' => $year,
            'months' => $this->buildMonthlyTrend($year),
        ];
    }

    public function studentMonthlyTrend(int $studentId, ?int $year = null): array
    {
        $year = $year ?? now()->year;

        $buckets = $this->monthlyBuckets($year, $studentId);

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $start = now()->setDate($year, $m, 1)->startOfMonth();
            $bucket = $buckets[$m] ?? null;

            if ($bucket !== null && ($bucket['days'] ?? 0) > 0) {
                $days = $bucket['days'];
                $present = $bucket['present'];
                $late = $bucket['late'];
                $absent = max(0, $days - $present - $late);
                $rate = round((($present + $late) / max(1, $days)) * 1000) / 10;

                $months[] = [
                    'month' => $start->translatedFormat('M'),
                    'label' => $start->translatedFormat('M'),
                    'present' => $present,
                    'late' => $late,
                    'absent' => $absent,
                    'total' => $days,
                    'rate' => $rate,
                ];
            } else {
                $months[] = [
                    'month' => $start->translatedFormat('M'),
                    'label' => $start->translatedFormat('M'),
                    'present' => 0,
                    'late' => 0,
                    'absent' => 0,
                    'total' => 0,
                    'rate' => null,
                ];
            }
        }

        return $months;
    }

    private function buildMonthlyTrend(int $year): array
    {
        $buckets = $this->monthlyBuckets($year);
        $totalActiveStudents = Student::where('status', 'Active')->count();

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $start = now()->setDate($year, $m, 1)->startOfMonth();
            $bucket = $buckets[$m] ?? null;

            if ($bucket !== null && ($bucket['days'] ?? 0) > 0 && $totalActiveStudents > 0) {
                $expectedTotal = $totalActiveStudents * $bucket['days'];
                $present = $bucket['present'];
                $late = $bucket['late'];
                $absent = max(0, $expectedTotal - $present - $late);
                $rate = round((($present + $late) / max(1, $expectedTotal)) * 1000) / 10;

                $months[] = [
                    'label' => $start->translatedFormat('M'),
                    'present' => $present,
                    'late' => $late,
                    'absent' => $absent,
                    'total' => $expectedTotal,
                    'rate' => $rate,
                ];
            } else {
                $months[] = [
                    'label' => $start->translatedFormat('M'),
                    'present' => 0,
                    'late' => 0,
                    'absent' => 0,
                    'total' => 0,
                    'rate' => null,
                ];
            }
        }

        return $months;
    }

    private function monthlyBuckets(int $year, ?int $studentId = null): array
    {
        $query = Attendance::query()
            ->selectRaw('DATE(attendance_date) as d, COUNT(*) as total, '
                . "SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present, "
                . "SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late")
            ->whereYear('attendance_date', $year)
            ->groupByRaw('DATE(attendance_date)');

        if ($studentId) {
            $query->where('student_id', $studentId);
        }

        $buckets = [];

        foreach ($query->get() as $row) {
            $month = (int) substr((string) ($row->d ?? ''), 5, 2);
            $buckets[$month]['days'] = ($buckets[$month]['days'] ?? 0) + 1;
            $buckets[$month]['total'] = ($buckets[$month]['total'] ?? 0) + (int) ($row->total ?? 0);
            $buckets[$month]['present'] = ($buckets[$month]['present'] ?? 0) + (int) ($row->present ?? 0);
            $buckets[$month]['late'] = ($buckets[$month]['late'] ?? 0) + (int) ($row->late ?? 0);
        }

        return $buckets;
    }

    public function weeklyTrend(?int $weeks = 4): array
    {
        $startOfRange = now()->subWeeks($weeks - 1)->startOfWeek();
        $endOfRange = now()->endOfWeek();

        $rows = Attendance::query()
            ->selectRaw('DATE(attendance_date) as d, COUNT(*) as total, '
                . "SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present, "
                . "SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late")
            ->whereDate('attendance_date', '>=', $startOfRange->toDateString())
            ->whereDate('attendance_date', '<=', $endOfRange->toDateString())
            ->groupByRaw('DATE(attendance_date)')
            ->get();

        $byDate = [];
        foreach ($rows as $row) {
            $byDate[(string) ($row->d ?? '')] = [
                'total' => (int) ($row->total ?? 0),
                'present' => (int) ($row->present ?? 0),
                'late' => (int) ($row->late ?? 0),
            ];
        }

        $weekly = [];
        for ($i = $weeks - 1; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = now()->subWeeks($i)->endOfWeek();

            $total = 0;
            $present = 0;
            $late = 0;

            foreach ($byDate as $date => $counts) {
                if ($date >= $weekStart->toDateString() && $date <= $weekEnd->toDateString()) {
                    $total += $counts['total'];
                    $present += $counts['present'];
                    $late += $counts['late'];
                }
            }

            $weekly[] = [
                'label' => 'Week ' . $weekStart->weekOfYear,
                'total' => $total,
                'present' => $present,
                'late' => $late,
            ];
        }

        return $weekly;
    }

    public function classMonthlyReport(int $classId, int $month, int $year): array
    {
        $startOfMonth = now()->setDate($year, $month, 1)->startOfMonth();
        $endOfMonth = now()->setDate($year, $month, 1)->endOfMonth();
        $daysInMonth = (int) $startOfMonth->daysInMonth;

        $students = Student::where('class_id', $classId)
            ->where('status', 'Active')
            ->get();
        $studentIds = $students->pluck('id');
        $totalStudents = $studentIds->count();

        $attendances = Attendance::whereIn('student_id', $studentIds)
            ->whereDate('attendance_date', '>=', $startOfMonth)
            ->whereDate('attendance_date', '<=', $endOfMonth)
            ->get();
        $attendancesByStudent = $attendances->groupBy('student_id');

        $leaveRequests = LeaveRequest::whereIn('student_id', $studentIds)
            ->whereDate('start_date', '<=', $endOfMonth)
            ->whereDate('end_date', '>=', $startOfMonth)
            ->whereIn('approval_status', ['Approved', 'Pending'])
            ->get();
        $leavesByStudent = $leaveRequests->groupBy('student_id');

        $schoolDays = $this->countSchoolDays($startOfMonth, $endOfMonth);

        $recap = $students->map(function ($student) use ($attendancesByStudent, $leavesByStudent, $schoolDays, $startOfMonth, $endOfMonth) {
            $studentAttendances = $attendancesByStudent->get($student->id, collect())
                ->keyBy(fn ($a) => $a->attendance_date->toDateString());

            $studentLeaves = $leavesByStudent->get($student->id, collect());

            $present = 0;
            $permission = 0;
            $sick = 0;
            $pending = 0;
            $onTimeStudent = 0;

            for ($date = $startOfMonth->copy(); $date->lte($endOfMonth); $date->addDay()) {
                $dateStr = $date->toDateString();

                if (! $this->calendarService->isSchoolDay($dateStr)) {
                    continue;
                }

                $attendance = $studentAttendances->get($dateStr);

                if ($attendance) {
                    $present++;
                    if ($attendance->status !== 'Late') {
                        $onTimeStudent++;
                    }
                    continue;
                }

                $dayLeaves = $studentLeaves->filter(
                    fn ($l) => $dateStr >= $l->start_date->toDateString() && $dateStr <= $l->end_date->toDateString(),
                );

                if ($dayLeaves->isEmpty()) {
                    continue;
                }

                $dayLeave = $dayLeaves
                    ->sortByDesc(fn ($l) => [
                        $l->approval_status === 'Approved' ? 1 : 0,
                        $l->category === 'Sick' ? 1 : 0,
                    ])
                    ->first();

                if ($dayLeave->approval_status !== 'Approved') {
                    $pending++;
                    continue;
                }

                if ($dayLeave->category === 'Sick') {
                    $sick++;
                } else {
                    $permission++;
                }
            }

            $absent = max(0, $schoolDays - $present - $permission - $sick - $pending);

            $attendanceDenominator = $present + $permission + $sick + $absent;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'nis' => $student->nis,
                'present' => $present,
                'permission' => $permission,
                'sick' => $sick,
                'pending' => $pending,
                'absent' => $absent,
                'on_time' => $onTimeStudent,
                'late' => $present - $onTimeStudent,
                'discipline_rate' => $schoolDays > 0
                    ? round(($onTimeStudent / $schoolDays) * 100, 1)
                    : 0,
                'attendance_rate' => $attendanceDenominator > 0
                    ? round(($present / $attendanceDenominator) * 100, 1)
                    : 0,
            ];
        })->values();

        $daily = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $date = $startOfMonth->copy()->day($d);
            $dateStr = $date->toDateString();

            if (! $this->calendarService->isSchoolDay($dateStr)) {
                $daily[] = [
                    'date' => $dateStr,
                    'label' => $date->format('d'),
                    'on_time' => 0,
                    'late' => 0,
                    'permission' => 0,
                    'sick' => 0,
                    'pending' => 0,
                    'absent' => 0,
                    'is_non_school' => true,
                    'is_past' => $dateStr < now()->toDateString(),
                    'note' => $this->calendarService->nonSchoolDayNote($dateStr) ?? 'hari non-aktif',
                ];
                continue;
            }

            $dayAttendances = $attendances->filter(
                fn ($a) => $a->attendance_date->toDateString() === $dateStr,
            )->keyBy('student_id');

            $dayLeaves = $leaveRequests->filter(
                fn ($l) => $dateStr >= $l->start_date->toDateString() && $dateStr <= $l->end_date->toDateString(),
            )->groupBy('student_id');

            $onTime = 0;
            $late = 0;
            $permission = 0;
            $sick = 0;
            $pending = 0;

            foreach ($studentIds as $studentId) {
                $attendance = $dayAttendances->get($studentId);

                if ($attendance) {
                    if ($attendance->status === 'Late') {
                        $late++;
                    } else {
                        $onTime++;
                    }
                    continue;
                }

                $studentDayLeaves = $dayLeaves->get($studentId, collect());

                if ($studentDayLeaves->isEmpty()) {
                    continue;
                }

                $dayLeave = $studentDayLeaves
                    ->sortByDesc(fn ($l) => [
                        $l->approval_status === 'Approved' ? 1 : 0,
                        $l->category === 'Sick' ? 1 : 0,
                    ])
                    ->first();

                if ($dayLeave->approval_status !== 'Approved') {
                    $pending++;
                    continue;
                }

                if ($dayLeave->category === 'Sick') {
                    $sick++;
                } else {
                    $permission++;
                }
            }

            $totalRecorded = $onTime + $late + $permission + $sick + $pending;
            $absent = $this->calendarService->isAlpaApplicable($dateStr)
                ? max(0, $totalStudents - $totalRecorded)
                : 0;

            $daily[] = [
                'date' => $dateStr,
                'label' => $date->format('d'),
                'on_time' => $onTime,
                'late' => $late,
                'permission' => $permission,
                'sick' => $sick,
                'pending' => $pending,
                'absent' => $absent,
            ];
        }

        $totalOnTime = array_sum(array_column($daily, 'on_time'));
        $totalLate = array_sum(array_column($daily, 'late'));
        $totalPermission = array_sum(array_column($daily, 'permission'));
        $totalSick = array_sum(array_column($daily, 'sick'));
        $totalPending = array_sum(array_column($daily, 'pending'));
        $totalAbsent = array_sum(array_column($daily, 'absent'));
        $rateDenominator = $totalOnTime + $totalLate + $totalPermission + $totalSick + $totalAbsent;

        $summary = [
            'on_time' => $totalOnTime,
            'late' => $totalLate,
            'permission' => $totalPermission,
            'sick' => $totalSick,
            'pending' => $totalPending,
            'absent' => $totalAbsent,
            'attendance_rate' => $rateDenominator > 0
                ? round((($totalOnTime + $totalLate) / $rateDenominator) * 100, 1)
                : 0,
            'total_students' => $totalStudents,
            'school_days' => $schoolDays,
            'discipline_rate' => ($schoolDays > 0 && $totalStudents > 0)
                ? round(($totalOnTime / ($schoolDays * $totalStudents)) * 100, 1)
                : 0,
        ];

        return [
            'recap' => $recap,
            'daily' => $daily,
            'summary' => $summary,
        ];
    }

    public function classMonthlyRecap(int $classId, int $month, int $year): array
    {
        $report = $this->classMonthlyReport($classId, $month, $year);

        return [
            'class' => ['id' => $classId, 'name' => SchoolClass::find($classId)->name],
            'month' => $month,
            'year' => $year,
            'students' => $report['recap'],
        ];
    }

    public function kelasPerbandingan(?string $date = null): Collection
    {
        $date = $date ?? now()->toDateString();
        $classes = SchoolClass::all();

        $studentsByClass = Student::where('status', 'Active')
            ->get()
            ->groupBy('class_id');

        $attendances = Attendance::with('student')
            ->whereDate('attendance_date', $date)
            ->get();

        return $classes->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'total' => $studentsByClass->get($c->id)?->count() ?? 0,
            'present' => $attendances->where('student.class_id', $c->id)->where('status', 'Present')->count(),
            'late' => $attendances->where('student.class_id', $c->id)->where('status', 'Late')->count(),
        ]);
    }

    private function countSchoolDays(Carbon $start, Carbon $end): int
    {
        $days = 0;
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $dateStr = $date->toDateString();
            if ($this->calendarService->isSchoolDay($dateStr) && $this->calendarService->isAlpaApplicable($dateStr)) {
                $days++;
            }
        }

        return $days;
    }
}
