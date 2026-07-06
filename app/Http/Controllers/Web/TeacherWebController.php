<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\DutySchedule;
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
            return redirect()->route('dashboard')->with('error', 'Data guru tidak ditemukan.');
        }

        $today = now()->format('l');
        $isScheduled = DutySchedule::where('teacher_id', $teacher->id)
            ->where('duty_day', $today)
            ->exists();

        $classStats = [];
        $classes = \App\Models\SchoolClass::all();

        foreach ($classes as $class) {
            $stats = $this->attendanceService->stats($class->id);
            $classStats[] = [
                'class' => $class->name,
                'total' => $stats['total'],
                'present' => $stats['present'],
                'late' => $stats['late'],
                'absent' => $stats['absent'],
                'pending_leaves' => $stats['sick_permission'],
            ];
        }

        return Inertia::render('Guru/DashboardPiket', [
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
            return redirect()->route('dashboard')->with('error', 'Data guru tidak ditemukan.');
        }

        $schoolClass = $teacher->schoolClasses()->first();

        if (! $schoolClass) {
            return Inertia::render('Guru/DashboardWaliKelas', [
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

        return Inertia::render('Guru/DashboardWaliKelas', [
            'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
            'class' => ['id' => $schoolClass->id, 'name' => $schoolClass->name],
            'students' => $students,
            'stats' => $stats,
        ]);
    }
}
