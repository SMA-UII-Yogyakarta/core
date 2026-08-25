<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\HomeroomScope;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonthlyReportController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
        protected HomeroomScope $homeroomScope,
    ) {
    }

    public function index(Request $request)
    {
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);
        $classId = $request->integer('class_id') ?: null;

        $this->homeroomScope->assertClassAllowed($request->user(), $classId);

        $monthlyStats = $this->analyticsService->monthlyTrend((int) $year);
        $classDetail = $classId ? $this->analyticsService->classDetail($classId, now()->setDate((int) $year, (int) $month, 1)->endOfMonth()->toDateString()) : null;
        $classes = $this->homeroomScope->classesFor($request->user());

        return Inertia::render('Reports/Monthly', [
            'monthlyStats' => $monthlyStats,
            'classDetail' => $classDetail,
            'classes' => $classes,
            'selectedMonth' => (int) $month,
            'selectedYear' => (int) $year,
            'selectedClassId' => $classId,
        ]);
    }
}
