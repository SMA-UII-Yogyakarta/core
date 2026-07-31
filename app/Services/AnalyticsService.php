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

        $total = Student::where('status', 'Active')->count();
        $attendances = Attendance::whereDate('attendance_date', $date)->get();

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
            'total' => Student::where('class_id', $c->id)->where('status', 'Active')->count(),
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
            'status' => $attendances->get($s->id)?->status ?? 'Absent',
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
        $months = [];

        for ($m = 1; $m <= 12; $m++) {
            $start = now()->setDate($year, $m, 1)->startOfMonth();

            $total = Attendance::where('student_id', $studentId)
                ->whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $m)
                ->count();

            $present = Attendance::where('student_id', $studentId)
                ->whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $m)
                ->where('status', 'Present')
                ->count();

            $late = Attendance::where('student_id', $studentId)
                ->whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $m)
                ->where('status', 'Late')
                ->count();

            $absent = max(0, $total - $present - $late);

            $months[] = [
                'month' => $start->translatedFormat('M'),
                'label' => $start->translatedFormat('M'),
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
            ];
        }

        return $months;
    }

    private function buildMonthlyTrend(int $year): array
    {
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $start = now()->setDate($year, $m, 1)->startOfMonth();

            $total = Attendance::whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $m)
                ->count();

            $present = Attendance::whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $m)
                ->where('status', 'Present')
                ->count();

            $late = Attendance::whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $m)
                ->where('status', 'Late')
                ->count();

            $months[] = [
                'label' => $start->translatedFormat('M'),
                'present' => $present,
                'late' => $late,
            ];
        }
        return $months;
    }

    public function weeklyTrend(?int $weeks = 4): array
    {
        $weekly = [];
        for ($i = $weeks - 1; $i >= 0; $i--) {
            $start = now()->subWeeks($i)->startOfWeek();
            $end = now()->subWeeks($i)->endOfWeek();

            $total = Attendance::whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()])->count();
            $present = Attendance::whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()])->where('status', 'Present')->count();
            $late = Attendance::whereBetween('attendance_date', [$start->toDateString(), $end->toDateString()])->where('status', 'Late')->count();

            $weekly[] = [
                'label' => 'Week ' . now()->subWeeks($weeks - 1 - $i)->weekOfYear,
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

        return $classes->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'total' => Student::where('class_id', $c->id)->where('status', 'Active')->count(),
            'present' => Attendance::whereDate('attendance_date', $date)
                ->where('status', 'Present')
                ->whereHas('student', fn ($q) => $q->where('class_id', $c->id))
                ->count(),
            'late' => Attendance::whereDate('attendance_date', $date)
                ->where('status', 'Late')
                ->whereHas('student', fn ($q) => $q->where('class_id', $c->id))
                ->count(),
        ]);
    }
}
