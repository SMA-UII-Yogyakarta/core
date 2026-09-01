<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Services\AcademicCalendarService;
use App\Services\AnalyticsService;
use App\Services\TeacherService;
use Inertia\Inertia;

class HomeroomReportController extends Controller
{
    public function __construct(
        protected TeacherService $teacherService,
        protected AnalyticsService $analyticsService,
        protected AcademicCalendarService $calendarService,
    ) {
    }

    public function __invoke(ReportRequest $request)
    {
        $teacher = $this->teacherService->findByUserId(auth()->id());

        if (! $teacher) {
            return redirect()->route('dashboard')->with('error', 'Teacher data not found.');
        }

        $schoolClass = $teacher->schoolClasses()->first();
        $tab = $request->input('tab', 'daily');

        $props = [
            'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
            'class' => $schoolClass ? ['id' => $schoolClass->id, 'name' => $schoolClass->name] : null,
            'tab' => $tab,
        ];

        if (! $schoolClass) {
            $props['students'] = [];
            $props['selectedDate'] = $request->input('date', now()->toDateString());
            $props['selectedMonth'] = (int) $request->input('month', now()->month);
            $props['selectedYear'] = (int) $request->input('year', now()->year);
            $props['selectedSemester'] = $request->input('semester', '1');

            return Inertia::render('Teacher/Reports/Index', $props);
        }

        match ($tab) {
            'daily' => $this->loadDaily($request, $schoolClass, $props),
            'monthly' => $this->loadMonthly($request, $schoolClass, $props),
            'semester' => $this->loadSemester($request, $schoolClass, $props),
            default => $this->loadDaily($request, $schoolClass, $props),
        };

        return Inertia::render('Teacher/Reports/Index', $props);
    }

    private function loadDaily(ReportRequest $request, $schoolClass, array &$props): void
    {
        $date = $request->input('date', now()->toDateString());
        $isHoliday = ! $this->calendarService->isSchoolDay($date);

        $props['students'] = $isHoliday ? [] : $this->analyticsService->classDetail($schoolClass->id, $date)['students'];
        $props['selectedDate'] = $date;
        $props['isHoliday'] = $isHoliday;
    }

    private function loadMonthly(ReportRequest $request, $schoolClass, array &$props): void
    {
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $report = $this->analyticsService->classMonthlyReport($schoolClass->id, $month, $year);

        $props['students'] = $report['recap'];
        $props['dailyBreakdown'] = $report['daily'];
        $props['summary'] = $report['summary'];
        $props['selectedMonth'] = $month;
        $props['selectedYear'] = $year;
    }

    private function loadSemester(ReportRequest $request, $schoolClass, array &$props): void
    {
        $semester = $request->input('semester', '1');
        $year = (int) $request->input('year', now()->year);

        $monthStart = $semester === '1' ? 7 : 1;
        $monthEnd = $semester === '1' ? 12 : 6;
        $yearStart = $semester === '1' ? $year - 1 : $year;

        $allStudentsRecap = collect();
        $monthlyBreakdown = [];

        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        for ($m = $monthStart; $m <= $monthEnd; $m++) {
            $y = $m >= 7 ? $yearStart + 1 : $yearStart;
            $report = $this->analyticsService->classMonthlyReport($schoolClass->id, $m, $y);
            $allStudentsRecap = $allStudentsRecap->merge($report['recap']);

            $monthlyBreakdown[] = [
                'month_label' => $monthNames[$m - 1] . ' ' . $y,
                'on_time' => $report['summary']['on_time'],
                'late' => $report['summary']['late'],
                'permission' => $report['summary']['permission'],
                'sick' => $report['summary']['sick'],
                'pending' => $report['summary']['pending'],
                'absent' => $report['summary']['absent'],
                'school_days' => $report['summary']['school_days'],
            ];
        }

        $totalHeb = array_sum(array_column($monthlyBreakdown, 'school_days'));
        $totalStudentCount = $allStudentsRecap->pluck('id')->unique()->count();

        $grouped = $allStudentsRecap->groupBy('id')->map(function ($records) use ($totalHeb) {
            $first = $records->first();
            $onTimeTotal = $records->sum('on_time');

            $attendanceDenominator = $records->sum('present')
                + $records->sum('permission')
                + $records->sum('sick')
                + $records->sum('absent');

            return [
                'id' => $first['id'],
                'name' => $first['name'],
                'nis' => $first['nis'],
                'present' => $records->sum('present'),
                'permission' => $records->sum('permission'),
                'sick' => $records->sum('sick'),
                'pending' => $records->sum('pending'),
                'absent' => $records->sum('absent'),
                'on_time' => $onTimeTotal,
                'late' => $records->sum('present') - $onTimeTotal,
                'discipline_rate' => $totalHeb > 0
                    ? round(($onTimeTotal / $totalHeb) * 100, 1)
                    : 0,
                'attendance_rate' => $attendanceDenominator > 0
                    ? round(($records->sum('present') / $attendanceDenominator) * 100, 1)
                    : 0,
            ];
        })->values();

        $totalOnTime = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'on_time')) : 0;
        $totalLate = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'late')) : 0;
        $totalPermission = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'permission')) : 0;
        $totalSick = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'sick')) : 0;
        $totalPending = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'pending')) : 0;
        $totalAbsent = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'absent')) : 0;
        $rateDenominator = $totalOnTime + $totalLate + $totalPermission + $totalSick + $totalAbsent;

        $props['students'] = $grouped;
        $props['monthlyBreakdown'] = $monthlyBreakdown;
        $props['summary'] = [
            'on_time' => $totalOnTime,
            'late' => $totalLate,
            'permission' => $totalPermission,
            'sick' => $totalSick,
            'pending' => $totalPending,
            'absent' => $totalAbsent,
            'attendance_rate' => $rateDenominator > 0
                ? round((($totalOnTime + $totalLate) / $rateDenominator) * 100, 1)
                : 0,
            'school_days' => $totalHeb,
            'discipline_rate' => ($totalHeb > 0 && $totalStudentCount > 0)
                ? round(($totalOnTime / ($totalHeb * $totalStudentCount)) * 100, 1)
                : 0,
            'total_students' => $totalStudentCount,
        ];
        $props['selectedSemester'] = $semester;
        $props['selectedYear'] = $year;
    }
}
