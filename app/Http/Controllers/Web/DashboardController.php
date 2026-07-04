<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService,
    ) {
    }

    public function index()
    {
        $stats = $this->dashboardService->getAdminStats();
        $todayAttendance = $this->dashboardService->getTodayAttendance();
        $pendingLeaveCount = $this->dashboardService->getPendingLeaveCount();
        $monthlyStats = $this->dashboardService->getMonthlyAttendanceStats();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'todayAttendance' => $todayAttendance,
            'pendingLeaveCount' => $pendingLeaveCount,
            'monthlyStats' => $monthlyStats,
        ]);
    }
}
