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
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherPortalController extends Controller
{
    public function __construct(
        protected TeacherService $teacherService,
        protected AttendanceService $attendanceService,
        protected DutyScheduleService $dutyScheduleService,
    ) {
    }

    public function dutyDashboard(Request $request)
    {
        $teacher = $this->teacherService->findByUserId(auth()->id());

        if (! $teacher) {
            return redirect()->route('dashboard')->with('error', __('messages.teacher_not_found'));
        }

        $filters = $request->validate([
            'class_id' => ['nullable', 'integer', 'exists:school_classes,id'],
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);
        $selectedDate = $filters['date'] ?? now()->toDateString();
        $selectedClassId = isset($filters['class_id']) ? (int) $filters['class_id'] : null;
        $dayName = Carbon::parse($selectedDate)->format('l');
        $isScheduled = DutySchedule::where('teacher_id', $teacher->id)
            ->where('duty_day', $dayName)
            ->exists();

        $allClasses = SchoolClass::with(['students' => fn ($q) => $q->where('status', 'Active')])->get();
        $classes = $selectedClassId
            ? $allClasses->where('id', $selectedClassId)->values()
            : $allClasses;
        $studentIds = $classes->flatMap(fn ($c) => $c->students->pluck('id'))->all();

        $attendances = Attendance::whereDate('attendance_date', $selectedDate)
            ->whereIn('student_id', $studentIds)
            ->get();

        $approvedLeaves = LeaveRequest::where('approval_status', 'Approved')
            ->whereDate('start_date', '<=', $selectedDate)
            ->whereDate('end_date', '>=', $selectedDate)
            ->whereIn('student_id', $studentIds)
            ->get();

        $classStats = $classes->map(function ($class) use ($attendances, $approvedLeaves) {
            $ids = $class->students->pluck('id');
            $classAttendances = $attendances->whereIn('student_id', $ids);
            $present = $classAttendances->where('status', 'Present')->count();
            $late = $classAttendances->where('status', 'Late')->count();
            $sickPermission = $approvedLeaves->whereIn('student_id', $ids)->count();

            return [
                'class_id' => $class->id,
                'class' => $class->name,
                'total' => $class->students->count(),
                'present' => $present,
                'late' => $late,
                'absent' => max(0, $class->students->count() - $present - $late - $sickPermission),
                'sick_permission' => $sickPermission,
            ];
        })->values()->all();

        $allLeaves = LeaveRequest::whereIn('approval_status', ['Pending', 'Approved'])
            ->whereDate('start_date', '<=', $selectedDate)
            ->whereDate('end_date', '>=', $selectedDate)
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
                    $status = 'absent';
                } elseif (strcasecmp($att->status, 'Late') === 0) {
                    $status = 'late';
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

        $totals = collect($classStats)->reduce(
            fn (array $carry, array $classStat) => [
                'total' => $carry['total'] + $classStat['total'],
                'present' => $carry['present'] + $classStat['present'],
                'late' => $carry['late'] + $classStat['late'],
                'sick_permission' => $carry['sick_permission'] + $classStat['sick_permission'],
                'absent' => $carry['absent'] + $classStat['absent'],
            ],
            ['total' => 0, 'present' => 0, 'late' => 0, 'sick_permission' => 0, 'absent' => 0],
        );

        $classesList = $allClasses->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values()->all();

        return Inertia::render('Teacher/DutyDashboard', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ],
            'isScheduled' => $isScheduled,
            'today' => Carbon::parse($selectedDate)->translatedFormat('l, d F Y'),
            'selectedDate' => $selectedDate,
            'selectedClassId' => $selectedClassId,
            'classStats' => $classStats,
            'attentionStudents' => $attentionStudents,
            'classes' => $classesList,
            'totals' => $totals,
        ]);
    }

    public function homeroomDashboard()
    {
        $teacher = $this->teacherService->findByUserId(auth()->id());

        if (! $teacher) {
            return redirect()->route('dashboard')->with('error', __('messages.teacher_not_found'));
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
}
