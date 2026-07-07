<?php

namespace App\Http\Controllers\Web\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Student;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $student = Student::with(['class'])->where('user_id', $user->id)->firstOrFail();

        $month = request('month', now()->month);
        $year = request('year', now()->year);

        $attendances = Attendance::where('student_id', $student->id)
            ->whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->latest('attendance_date')
            ->get();

        $leaveRequests = LeaveRequest::where('student_id', $student->id)
            ->latest()
            ->get();

        $monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
        ];

        $present = $attendances->where('status', 'Present')->count();
        $late = $attendances->where('status', 'Late')->count();

        return Inertia::render('Student/AttendanceHistory', [
            'student' => $student,
            'attendances' => $attendances,
            'leaveRequests' => $leaveRequests,
            'month' => (int) $month,
            'year' => (int) $year,
            'stats' => [
                'total_days' => $attendances->count(),
                'present' => $present,
                'late' => $late,
                'absent' => max(0, now()->daysInMonth - $attendances->count()),
            ],
            'monthName' => $monthNames[$month - 1],
        ]);
    }
}
