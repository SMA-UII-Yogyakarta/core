<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Support\Collection;

class AnalyticsService
{
    public function __construct(
        protected AttendanceService $attendanceService,
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

        $studentStats = $students->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'nis' => $s->nis,
            'status' => $attendances->get($s->id)->status ?? 'Absent',
            'check_in_time' => $attendances->get($s->id)?->check_in_time,
        ]);

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
            $bucket = $buckets[$m] ?? ['total' => 0, 'present' => 0, 'late' => 0];

            $months[] = [
                'month' => $start->translatedFormat('M'),
                'label' => $start->translatedFormat('M'),
                'present' => $bucket['present'],
                'late' => $bucket['late'],
                'absent' => max(0, $bucket['total'] - $bucket['present'] - $bucket['late']),
            ];
        }

        return $months;
    }

    private function buildMonthlyTrend(int $year): array
    {
        $buckets = $this->monthlyBuckets($year);

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $start = now()->setDate($year, $m, 1)->startOfMonth();
            $bucket = $buckets[$m] ?? ['total' => 0, 'present' => 0, 'late' => 0];

            $months[] = [
                'label' => $start->translatedFormat('M'),
                'present' => $bucket['present'],
                'late' => $bucket['late'],
            ];
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
}
