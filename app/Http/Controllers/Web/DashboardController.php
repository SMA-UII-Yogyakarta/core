<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Services\AnalyticsService;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService,
        protected AnalyticsService $analyticsService,
    ) {
    }

    public function redirect(Request $request)
    {
        return $this->index($request);
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        return match ($user->role) {
            'teacher' => match (session('active_teacher_role')) {
                'duty' => redirect()->route('teacher.duty'),
                'homeroom' => redirect()->route('teacher.homeroom'),
                default => $user->teacher?->isHomeroom()
                    ? redirect()->route('teacher.homeroom')
                    : redirect()->route('teacher.duty'),
            },
            'guardian' => redirect()->route('guardian.dashboard', $request->query()),
            'student' => redirect()->route('student.dashboard'),
            default => $this->adminDashboard($request),
        };
    }

    private function adminDashboard(Request $request)
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

        return Inertia::render('Admin/Dashboard', [
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
