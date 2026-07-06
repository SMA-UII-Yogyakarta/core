<?php

namespace App\Http\Controllers\Web\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\DutySchedule;
use App\Models\LeaveRequest;
use App\Models\Student;
use App\Services\SchoolClassService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GuruDashboardController extends Controller
{
    public function __construct(
        protected SchoolClassService $schoolClassService,
    ) {
    }

    public function piket()
    {
        $user = Auth::user();
        $teacher = \App\Models\Teacher::with(['user'])->where('user_id', $user->id)->firstOrFail();

        $today = now()->toDateString();
        $dayName = now()->format('l');

        $isScheduled = DutySchedule::where('teacher_id', $teacher->id)
            ->where('duty_day', $dayName)
            ->exists();

        $classes = \App\Models\SchoolClass::with(['students' => function ($q) {
            $q->where('status', 'Active');
        }])->get();

        $classStats = [];
        foreach ($classes as $class) {
            $studentIds = $class->students->pluck('id');
            $attendances = Attendance::where('attendance_date', $today)
                ->whereIn('student_id', $studentIds)
                ->get();

            $classStats[] = [
                'class' => $class->name,
                'total' => $class->students->count(),
                'present' => $attendances->where('status', 'Present')->count(),
                'late' => $attendances->where('status', 'Late')->count(),
                'absent' => $class->students->count() - $attendances->count(),
                'pending_leaves' => LeaveRequest::where('approval_status', 'Pending')
                    ->whereHas('student', fn ($q) => $q->whereIn('id', $studentIds))
                    ->count(),
            ];
        }

        return Inertia::render('Teacher/DutyDashboard', [
            'teacher' => $teacher,
            'isScheduled' => $isScheduled,
            'today' => $today,
            'classStats' => $classStats,
        ]);
    }

    public function waliKelas()
    {
        $user = Auth::user();
        $teacher = \App\Models\Teacher::with(['user', 'schoolClasses'])->where('user_id', $user->id)->firstOrFail();
        $class = $teacher->schoolClasses->first();

        if (! $class) {
            return Inertia::render('Teacher/HomeroomDashboard', [
                'teacher' => $teacher,
                'class' => null,
                'students' => [],
                'stats' => null,
            ]);
        }

        $today = now()->toDateString();
        $students = Student::with(['attendances' => function ($q) use ($today) {
            $q->where('attendance_date', $today);
        }])->where('class_id', $class->id)->where('status', 'Active')->get();

        $stats = [
            'total' => $students->count(),
            'hadir' => $students->filter(fn ($s) => $s->attendances->where('status', 'Present')->isNotEmpty())->count(),
            'terlambat' => $students->filter(fn ($s) => $s->attendances->where('status', 'Late')->isNotEmpty())->count(),
            'alpa' => $students->filter(fn ($s) => $s->attendances->isEmpty())->count(),
        ];

        return Inertia::render('Teacher/HomeroomDashboard', [
            'teacher' => $teacher,
            'class' => $class,
            'students' => $students,
            'stats' => $stats,
        ]);
    }
}
