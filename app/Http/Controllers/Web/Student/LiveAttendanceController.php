<?php

namespace App\Http\Controllers\Web\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LiveAttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
    ) {
    }

    public function index()
    {
        $user = Auth::user();
        $student = Student::with(['class'])->where('user_id', $user->id)->firstOrFail();

        $today = now()->toDateString();
        $todayAttendance = \App\Models\Attendance::where('student_id', $student->id)
            ->where('attendance_date', $today)
            ->first();

        return Inertia::render('Student/LiveAttendance', [
            'student' => $student,
            'todayAttendance' => $todayAttendance,
        ]);
    }

    public function checkIn(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo_url' => 'nullable|string',
        ]);

        try {
            $attendance = $this->attendanceService->checkIn($student->id, $validated);
            return redirect()->back()->with('success', 'Presensi berhasil!');
        } catch (\RuntimeException $e) {
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}
