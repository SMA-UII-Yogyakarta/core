<?php

namespace App\Http\Controllers\Web\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\AttendanceService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SiswaDashboardController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
    ) {
    }

    public function index()
    {
        $user = Auth::user();
        $student = Student::with(['class'])->where('user_id', $user->id)->firstOrFail();

        $todayAttendance = $this->attendanceService->history($student->id, 1);
        $recentHistory = $this->attendanceService->history($student->id, 30);
        $stats = $this->getStudentStats($student->id);

        return Inertia::render('Siswa/Dashboard', [
            'student' => $student,
            'todayAttendance' => $todayAttendance[0] ?? null,
            'recentHistory' => $recentHistory,
            'stats' => $stats,
        ]);
    }

    private function getStudentStats(int $studentId): array
    {
        $totalAttendance = \App\Models\Attendance::where('student_id', $studentId)->count();
        $present = \App\Models\Attendance::where('student_id', $studentId)->where('status', 'Present')->count();
        $late = \App\Models\Attendance::where('student_id', $studentId)->where('status', 'Late')->count();
        $pendingLeaves = \App\Models\LeaveRequest::where('student_id', $studentId)->where('approval_status', 'Pending')->count();

        return [
            'total_attendance' => $totalAttendance,
            'present' => $present,
            'late' => $late,
            'pending_leaves' => $pendingLeaves,
        ];
    }
}
