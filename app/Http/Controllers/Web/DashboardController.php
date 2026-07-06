<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Services\AnalyticsService;
use App\Services\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService,
        protected AnalyticsService $analyticsService,
    ) {
    }

    public function index()
    {
        $classId = request('class_id');
        $date = request('date', now()->toDateString());

        $stats = $this->dashboardService->getAdminStats();
        $todayAttendance = $this->dashboardService->getTodayAttendance();
        $pendingLeaveCount = $this->dashboardService->getPendingLeaveCount();
        $monthlyStats = $this->dashboardService->getMonthlyAttendanceStats();

        $overview = $this->analyticsService->schoolOverview($date);
        $monthlyTrend = $this->analyticsService->monthlyTrend();
        $weeklyTrend = $this->analyticsService->weeklyTrend();
        $classes = SchoolClass::select('id', 'name')->get();

        $classDetail = null;
        $studentDetail = null;

        if ($classId) {
            $classDetail = $this->analyticsService->classDetail((int) $classId, $date);

            $studentId = request('student_id');
            if ($studentId) {
                $month = (int) request('month', now()->month);
                $year = (int) request('year', now()->year);
                $studentDetail = $this->analyticsService->studentDetail((int) $studentId, $month, $year);
            }
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'todayAttendance' => $todayAttendance,
            'pendingLeaveCount' => $pendingLeaveCount,
            'monthlyStats' => $monthlyStats,
            'overview' => $overview,
            'monthlyTrend' => $monthlyTrend,
            'weeklyTrend' => $weeklyTrend,
            'classes' => $classes,
            'selectedClassId' => $classId ? (int) $classId : null,
            'classDetail' => $classDetail,
            'studentDetail' => $studentDetail,
            'selectedDate' => $date,
        ]);
    }
}
