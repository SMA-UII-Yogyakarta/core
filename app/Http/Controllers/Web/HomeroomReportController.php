<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AcademicCalendarService;
use App\Services\AnalyticsService;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeroomReportController extends Controller
{
    public function __construct(
        protected TeacherService $teacherService,
        protected AnalyticsService $analyticsService,
        protected AcademicCalendarService $calendarService,
    ) {
    }

    public function __invoke(Request $request)
    {
        $teacher = $this->teacherService->findByUserId(auth()->id());

        if (! $teacher) {
            return redirect()->route('dashboard')->with('error', 'Teacher data not found.');
        }

        $schoolClass = $teacher->schoolClasses()->first();
        $tab = $request->query('tab', 'daily');

        $props = [
            'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
            'class' => $schoolClass ? ['id' => $schoolClass->id, 'name' => $schoolClass->name] : null,
            'tab' => $tab,
        ];

        if (! $schoolClass) {
            $props['students'] = [];
            $props['selectedDate'] = $request->query('date', now()->toDateString());
            $props['selectedMonth'] = (int) $request->query('month', now()->month);
            $props['selectedYear'] = (int) $request->query('year', now()->year);
            $props['selectedSemester'] = $request->query('semester', '1');

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

    private function loadDaily(Request $request, $schoolClass, array &$props): void
    {
        $date = $request->query('date', now()->toDateString());
        $isHoliday = ! $this->calendarService->isSchoolDay($date);

        $props['students'] = $isHoliday ? [] : $this->analyticsService->classDetail($schoolClass->id, $date)['students'];
        $props['selectedDate'] = $date;
        $props['isHoliday'] = $isHoliday;
    }

    private function loadMonthly(Request $request, $schoolClass, array &$props): void
    {
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);
        $report = $this->analyticsService->classMonthlyReport($schoolClass->id, $month, $year);

        $props['students'] = $report['recap'];
        $props['dailyBreakdown'] = $report['daily'];
        $props['summary'] = $report['summary'];
        $props['selectedMonth'] = $month;
        $props['selectedYear'] = $year;
    }

    private function loadSemester(Request $request, $schoolClass, array &$props): void
    {
        $semester = $request->query('semester', '1');
        $year = (int) $request->query('year', now()->year);

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
                'tepat_waktu' => $report['summary']['tepat_waktu'],
                'terlambat' => $report['summary']['terlambat'],
                'izin' => $report['summary']['izin'],
                'sakit' => $report['summary']['sakit'],
                'tertunda' => $report['summary']['tertunda'],
                'alpa' => $report['summary']['alpa'],
                'school_days' => $report['summary']['school_days'],
            ];
        }

        $totalHeb = array_sum(array_column($monthlyBreakdown, 'school_days'));
        $totalStudentCount = $allStudentsRecap->pluck('id')->unique()->count();

        $grouped = $allStudentsRecap->groupBy('id')->map(function ($records) use ($totalHeb) {
            $first = $records->first();
            $tepatWaktu = $records->sum('tepat_waktu');

            $attendanceDenominator = $records->sum('masuk')
                + $records->sum('izin')
                + $records->sum('sakit')
                + $records->sum('alpha');

            return [
                'id' => $first['id'],
                'name' => $first['name'],
                'nis' => $first['nis'],
                'masuk' => $records->sum('masuk'),
                'izin' => $records->sum('izin'),
                'sakit' => $records->sum('sakit'),
                'tertunda' => $records->sum('tertunda'),
                'alpha' => $records->sum('alpha'),
                'tepat_waktu' => $tepatWaktu,
                'discipline_rate' => $totalHeb > 0
                    ? round(($tepatWaktu / $totalHeb) * 100, 1)
                    : 0,
                'attendance_rate' => $attendanceDenominator > 0
                    ? round(($records->sum('masuk') / $attendanceDenominator) * 100, 1)
                    : 0,
            ];
        })->values();

        $totalPresent = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'tepat_waktu')) : 0;
        $totalLate = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'terlambat')) : 0;
        $totalIzin = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'izin')) : 0;
        $totalSakit = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'sakit')) : 0;
        $totalTertunda = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'tertunda')) : 0;
        $totalAlpa = $monthlyBreakdown ? array_sum(array_column($monthlyBreakdown, 'alpa')) : 0;
        $rateDenominator = $totalPresent + $totalLate + $totalIzin + $totalSakit + $totalAlpa;

        $props['students'] = $grouped;
        $props['monthlyBreakdown'] = $monthlyBreakdown;
        $props['summary'] = [
            'tepat_waktu' => $totalPresent,
            'terlambat' => $totalLate,
            'izin' => $totalIzin,
            'sakit' => $totalSakit,
            'tertunda' => $totalTertunda,
            'alpa' => $totalAlpa,
            'attendance_rate' => $rateDenominator > 0
                ? round((($totalPresent + $totalLate) / $rateDenominator) * 100, 1)
                : 0,
            'school_days' => $totalHeb,
            'discipline_rate' => ($totalHeb > 0 && $totalStudentCount > 0)
                ? round(($totalPresent / ($totalHeb * $totalStudentCount)) * 100, 1)
                : 0,
            'total_students' => $totalStudentCount,
        ];
        $props['selectedSemester'] = $semester;
        $props['selectedYear'] = $year;
    }
}
