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

class TeacherPortalController extends Controller
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
                'class_id' => $class->id,
                'class' => $class->name,
                'total' => $class->students->count(),
                'present' => $classAttendances->where('status', 'Present')->count(),
                'late' => $classAttendances->where('status', 'Late')->count(),
                'absent' => max(0, $class->students->count() - $classAttendances->count()),
                'sick_permission' => $sickPermits->whereIn('student_id', $ids)->count(),
            ];
        })->values()->all();

        $allLeaves = LeaveRequest::whereIn('approval_status', ['Pending', 'Approved'])
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->whereIn('student_id', $studentIds)
            ->get();

        $attentionStudents = [];
        foreach ($classes as $class) {
            foreach ($class->students as $student) {
                $att = $attendances->where('student_id', $student->id)->first();
                $leave = $allLeaves->where('student_id', $student->id)->first();

                $status = null;
                if ($leave) {
                    $status = $leave->approval_status === 'Pending' ? 'pending' : 'diizinkan';
                } elseif (! $att) {
                    $status = 'alpa';
                } elseif (strcasecmp($att->status, 'Late') === 0) {
                    $status = 'terlambat';
                }

                if ($status) {
                    $attentionStudents[] = [
                        'id' => $student->id,
                        'nis' => $student->nis,
                        'name' => $student->name,
                        'class' => $class->name,
                        'status' => $status,
                        'check_in_time' => $att ? $att->check_in_time : null,
                        'leave_category' => $leave ? $leave->category : null,
                        'leave_approval' => $leave ? $leave->approval_status : null,
                    ];
                }
            }
        }

        $classesList = $classes->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values()->all();

        return Inertia::render('Teacher/DutyDashboard', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ],
            'isScheduled' => $isScheduled,
            'today' => now()->translatedFormat('l, d F Y'),
            'classStats' => $classStats,
            'attentionStudents' => $attentionStudents,
            'classes' => $classesList,
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
            ->get();

        $studentIds = $students->pluck('id')->all();

        $pendingLeaves = LeaveRequest::where('approval_status', 'Pending')
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');

        $studentsData = [];
        foreach ($students as $s) {
            $attendancesData = [];
            foreach ($s->attendances as $a) {
                $attendancesData[] = [
                    'id' => $a->id,
                    'status' => $a->status,
                    'check_in_time' => $a->check_in_time,
                ];
            }
            $pendingLeave = $pendingLeaves->get($s->id);
            $studentsData[] = [
                'id' => $s->id,
                'nis' => $s->nis,
                'nisn' => $s->nisn,
                'name' => $s->name,
                'attendances' => $attendancesData,
                'pendingLeave' => $pendingLeave ? [
                    'id' => $pendingLeave->id,
                    'category' => $pendingLeave->category,
                    'approval_status' => $pendingLeave->approval_status,
                    'description' => $pendingLeave->description,
                    'document_url' => $pendingLeave->document_url,
                    'start_date' => $pendingLeave->start_date->format('Y-m-d'),
                    'created_at' => $pendingLeave->created_at->toIso8601String(),
                ] : null,
            ];
        }

        $stats = $this->attendanceService->stats($schoolClass->id);

        return Inertia::render('Teacher/HomeroomDashboard', [
            'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
            'class' => ['id' => $schoolClass->id, 'name' => $schoolClass->name],
            'students' => $studentsData,
            'stats' => $stats,
            'pendingLeaveCount' => $pendingLeaves->count(),
        ]);
    }

    /**
     * TODO: Remove this preview method after Step 2 (backend) is done.
     * This is temporary for frontend review purposes only.
     */
    public function leaveVerificationPreview()
    {
        $teacher = $this->teacherService->findByUserId(auth()->id());

        return Inertia::render('Teacher/LeaveVerification', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ],
            'class' => null,
        ]);
    }
}
