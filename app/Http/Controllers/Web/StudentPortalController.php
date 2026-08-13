<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentPortalController extends Controller
{
    public function __construct(
        protected StudentService $studentService,
        protected AttendanceService $attendanceService,
    ) {
    }

    public function dashboard()
    {
        $student = $this->studentService->findByUserId(auth()->id());

        if (! $student) {
            return redirect()->route('dashboard')->with('error', 'Student data not found.');
        }

        $todayAttendance = $this->attendanceService->todayByStudent($student->id);
        $stats = $this->attendanceService->getStudentStats($student->id);
        $recentHistory = $this->attendanceService->history($student->id, 10);

        return Inertia::render('Student/Dashboard', [
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'class' => $student->class ? ['id' => $student->class->id, 'name' => $student->class->name] : null,
            ],
            'todayAttendance' => $todayAttendance ? [
                'id' => $todayAttendance->id,
                'status' => $todayAttendance->status,
                'check_in_time' => $todayAttendance->check_in_time,
                'attendance_date' => $todayAttendance->attendance_date->toDateString(),
            ] : null,
            'recentHistory' => $recentHistory->items(),
            'stats' => $stats,
        ]);
    }

    public function liveAttendance()
    {
        $student = $this->studentService->findByUserId(auth()->id());

        if (! $student) {
            return redirect()->route('dashboard')->with('error', 'Student data not found.');
        }

        $todayAttendance = $this->attendanceService->todayByStudent($student->id);

        return Inertia::render('Student/LiveAttendance', [
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'name' => $student->name,
                'class' => $student->class ? ['id' => $student->class->id, 'name' => $student->class->name] : null,
            ],
            'todayAttendance' => $todayAttendance ? [
                'id' => $todayAttendance->id,
                'status' => $todayAttendance->status,
                'check_in_time' => $todayAttendance->check_in_time,
                'attendance_date' => $todayAttendance->attendance_date->toDateString(),
            ] : null,
        ]);
    }

    public function checkIn(Request $request)
    {
        $student = $this->studentService->findByUserId(auth()->id());

        if (! $student) {
            return redirect()->back()->with('error', 'Student data not found.');
        }

        try {
            $this->attendanceService->checkIn($student->id, $request->all());
            return redirect()->route('student.dashboard')->with('success', 'Check-in successful.');
        } catch (\RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function history()
    {
        $student = $this->studentService->findByUserId(auth()->id());

        if (! $student) {
            return redirect()->route('dashboard')->with('error', 'Student data not found.');
        }

        $month = (int) request('month', date('m'));
        $year = (int) request('year', date('Y'));

        $attendances = $this->attendanceService->history($student->id, 100, $month, $year);

        return Inertia::render('Student/AttendanceHistory', [
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'name' => $student->name,
                'class' => $student->class
                    ? ['id' => $student->class->id, 'name' => $student->class->name]
                    : null,
            ],
            'attendances' => collect($attendances->items())->map(fn ($att) => [
                'id' => $att->id,
                'status' => $att->status,
                'check_in_time' => $att->check_in_time,
                'attendance_date' => $att->attendance_date instanceof \Carbon\Carbon
                    ? $att->attendance_date->toDateString()
                    : $att->attendance_date,
                'photo_url' => $att->photo_url ?? null,
            ])->values()->all(),
            'month' => $month,
            'year' => $year,
        ]);
    }
}
