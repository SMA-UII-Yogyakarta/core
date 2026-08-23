<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\HomeroomScope;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemesterReportController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
        protected HomeroomScope $homeroomScope,
    ) {
    }

    public function index(Request $request)
    {
        $year = (int) $request->query('year', now()->year);
        $semester = (int) $request->query('semester', 1);
        $classId = $request->integer('class_id') ?: null;

        $this->homeroomScope->assertClassAllowed($request->user(), $classId);

        $monthlyStats = $this->analyticsService->monthlyTrend($year);
        $classes = $this->homeroomScope->classesFor($request->user());

        // Semester 1: months 1-6, Semester 2: months 7-12
        $semesterMonths = $semester === 1 ? range(1, 6) : range(7, 12);

        return Inertia::render('Reports/Semester', [
            'monthlyStats' => $monthlyStats,
            'classes' => $classes,
            'selectedYear' => $year,
            'selectedSemester' => $semester,
            'semesterMonths' => $semesterMonths,
            'selectedClassId' => $classId,
        ]);
    }
}
