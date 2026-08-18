<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeroomReportController extends Controller
{
    public function __construct(
        protected TeacherService $teacherService,
        protected AnalyticsService $analyticsService,
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
        $detail = $this->analyticsService->classDetail($schoolClass->id, $date);

        $props['students'] = $detail['students'];
        $props['selectedDate'] = $date;
    }

    private function loadMonthly(Request $request, $schoolClass, array &$props): void
    {
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);
        $recap = $this->analyticsService->classMonthlyRecap($schoolClass->id, $month, $year);

        $props['students'] = $recap['students'];
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
        for ($m = $monthStart; $m <= $monthEnd; $m++) {
            $y = $m >= 7 ? $yearStart + 1 : $yearStart;
            $recap = $this->analyticsService->classMonthlyRecap($schoolClass->id, $m, $y);
            $allStudentsRecap = $allStudentsRecap->merge($recap['students']);
        }

        $grouped = $allStudentsRecap->groupBy('id')->map(function ($records) {
            $first = $records->first();
            return [
                'id' => $first['id'],
                'name' => $first['name'],
                'nis' => $first['nis'],
                'masuk' => $records->sum('masuk'),
                'izin' => $records->sum('izin'),
                'sakit' => $records->sum('sakit'),
                'alpha' => $records->sum('alpha'),
            ];
        })->values();

        $props['students'] = $grouped;
        $props['selectedSemester'] = $semester;
        $props['selectedYear'] = $year;
    }
}
