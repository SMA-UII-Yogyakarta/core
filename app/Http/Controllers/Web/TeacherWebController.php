<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\DutySchedule;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Services\AttendanceService;
use App\Services\DutyScheduleService;
use App\Services\TeacherService;
use Inertia\Inertia;

class TeacherWebController extends Controller
{
    public function __construct(
        protected TeacherService $teacherService,
        protected AttendanceService $attendanceService,
        protected DutyScheduleService $dutyScheduleService,
    ) {
    }

    public function dutyDashboard()
    {
        $teacher = $this->teacherService->findByUserId(auth()->id());

        if (! $teacher) {
            return redirect()->route('dashboard')->with('error', 'Teacher data not found.');
        }

        $today = now()->toDateString();
        $dayName = now()->format('l');
        $isScheduled = DutySchedule::where('teacher_id', $teacher->id)
            ->where('duty_day', $dayName)
            ->exists();

        $classes = SchoolClass::with(['students' => fn ($q) => $q->where('status', 'Active')])->get();
        $studentIds = $classes->flatMap(fn ($c) => $c->students->pluck('id'))->all();

        $attendances = Attendance::whereDate('attendance_date', $today)
            ->whereIn('student_id', $studentIds)
            ->get();

        $sickPermits = LeaveRequest::where('approval_status', 'Approved')
            ->where('category', 'Sick')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->whereIn('student_id', $studentIds)
            ->get();

        $classStats = $classes->map(function ($class) use ($attendances, $sickPermits) {
            $ids = $class->students->pluck('id');
            $classAttendances = $attendances->whereIn('student_id', $ids);

            return [
                'class' => $class->name,
                'total' => $class->students->count(),
                'present' => $classAttendances->where('status', 'Present')->count(),
                'late' => $classAttendances->where('status', 'Late')->count(),
                'absent' => max(0, $class->students->count() - $classAttendances->count()),
                'sick_permission' => $sickPermits->whereIn('student_id', $ids)->count(),
            ];
        })->values()->all();

        return Inertia::render('Teacher/DutyDashboard', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ],
            'isScheduled' => $isScheduled,
            'today' => now()->translatedFormat('l, d F Y'),
            'classStats' => $classStats,
        ]);
    }

    public function homeroomDashboard()
    {
        $teacher = $this->teacherService->findByUserId(auth()->id());

        if (! $teacher) {
            return redirect()->route('dashboard')->with('error', 'Teacher data not found.');
        }

        $schoolClass = $teacher->schoolClasses()->first();

        if (! $schoolClass) {
            return Inertia::render('Teacher/HomeroomDashboard', [
                'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
                'class' => null,
                'students' => [],
                'stats' => null,
            ]);
        }

        $students = Student::with(['user', 'attendances' => function ($q) {
            $q->whereDate('attendance_date', now()->toDateString());
        }])->where('class_id', $schoolClass->id)
            ->where('status', 'Active')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'nis' => $s->nis,
                'name' => $s->name,
                'attendances' => $s->attendances->map(fn ($a) => [
                    'id' => $a->id,
                    'status' => $a->status,
                    'check_in_time' => $a->check_in_time,
                ])->toArray(),
            ])->toArray();

        $stats = $this->attendanceService->stats($schoolClass->id);

        return Inertia::render('Teacher/HomeroomDashboard', [
            'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
            'class' => ['id' => $schoolClass->id, 'name' => $schoolClass->name],
            'students' => $students,
            'stats' => $stats,
        ]);
    }
}
