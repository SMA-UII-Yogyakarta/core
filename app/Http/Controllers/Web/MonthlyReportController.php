<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonthlyReportController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
    ) {
    }

    public function index(Request $request)
    {
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);
        $classId = $request->query('class_id');

        $monthlyStats = $this->analyticsService->monthlyTrend($year);
        $classDetail = $classId ? $this->analyticsService->classDetail((int) $classId, now()->setDate($year, $month, 1)->endOfMonth()->toDateString()) : null;
        $classes = \App\Models\SchoolClass::select('id', 'name')->get();

        return Inertia::render('Reports/Monthly', [
            'monthlyStats' => $monthlyStats,
            'classDetail' => $classDetail,
            'classes' => $classes,
            'selectedMonth' => (int) $month,
            'selectedYear' => (int) $year,
            'selectedClassId' => $classId ? (int) $classId : null,
        ]);
    }
}
