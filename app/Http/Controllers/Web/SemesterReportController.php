<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemesterReportController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
    ) {
    }

    public function index(Request $request)
    {
        $year = $request->query('year', now()->year);
        $semester = $request->query('semester', 1);
        $classId = $request->query('class_id');

        $monthlyStats = $this->analyticsService->monthlyTrend($year);
        $classes = \App\Models\SchoolClass::select('id', 'name')->get();

        // Semester 1: months 1-6, Semester 2: months 7-12
        $semesterMonths = $semester === 1 ? range(1, 6) : range(7, 12);

        return Inertia::render('Reports/Semester', [
            'monthlyStats' => $monthlyStats,
            'classes' => $classes,
            'selectedYear' => (int) $year,
            'selectedSemester' => (int) $semester,
            'semesterMonths' => $semesterMonths,
            'selectedClassId' => $classId ? (int) $classId : null,
        ]);
    }
}
