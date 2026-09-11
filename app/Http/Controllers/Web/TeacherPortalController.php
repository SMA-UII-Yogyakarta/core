<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AcademicCalendar;
use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
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

        $isSchoolDay = AttendanceTimeSetting::where('day', now()->format('l'))
            ->where('is_active', true)
            ->exists()
            && ! AcademicCalendar::whereDate('holiday_date', now()->toDateString())
                ->where('is_holiday', true)
                ->exists();

        if (! $isSchoolDay) {
            return Inertia::render('Teacher/HomeroomDashboard', [
                'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
                'class' => ['id' => $schoolClass->id, 'name' => $schoolClass->name],
                'students' => [],
                'stats' => null,
                'isSchoolDay' => false,
                'pendingLeaveCount' => 0,
                'expiredPendingCount' => 0,
                'approvedLeaves' => [],
                'lateThreshold' => null,
            ]);
        }

        $students = Student::with(['user', 'guardian', 'attendances' => function ($q) {
            $q->whereDate('attendance_date', now()->toDateString());
        }])->where('class_id', $schoolClass->id)
            ->where('status', 'Active')
            ->get();

        $studentIds = $students->pluck('id')->all();

        $today = now()->toDateString();

        $pendingLeaves = LeaveRequest::where('approval_status', 'Pending')
            ->whereIn('student_id', $studentIds)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderBy('created_at', 'desc')
            ->get()
            ->keyBy('student_id');

        $approvedLeaves = LeaveRequest::where('approval_status', 'Approved')
            ->whereIn('student_id', $studentIds)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->with('guardian')
            ->orderBy('created_at', 'desc')
            ->get()
            ->keyBy('student_id');

        $expiredPendingCount = LeaveRequest::where('approval_status', 'Pending')
            ->whereIn('student_id', $studentIds)
            ->whereDate('end_date', '<', $today)
            ->count();

        $consecutiveAlpaStreaks = $this->attendanceService->getConsecutiveAlpaStreaks($studentIds);

        $studentsData = [];
        $lateThreshold = AttendanceTimeSetting::where('day', now()->format('l'))->first()?->late_threshold;

        foreach ($students as $s) {
            $attendancesData = [];
            foreach ($s->attendances as $a) {
                $lateMinutes = null;
                if ($a->check_in_time && strcasecmp($a->status, 'Late') === 0 && $lateThreshold) {
                    $lateMinutes = (int) ceil(($a->check_in_time->timestamp - $lateThreshold->timestamp) / 60);
                }
                $attendancesData[] = [
                    'id' => $a->id,
                    'status' => $a->status,
                    'check_in_time' => $a->check_in_time?->format('H:i:s'),
                    'late_minutes' => $lateMinutes,
                ];
            }
            $pendingLeave = $pendingLeaves->get($s->id);
            $studentsData[] = [
                'id' => $s->id,
                'nis' => $s->nis,
                'nisn' => $s->nisn,
                'name' => $s->name,
                'guardian_name' => $s->guardian?->name,
                'guardian_phone' => $s->guardian?->phone,
                'attendances' => $attendancesData,
                'pendingLeave' => $pendingLeave ? [
                    'id' => $pendingLeave->id,
                    'category' => $pendingLeave->category,
                    'approval_status' => $pendingLeave->approval_status,
                    'description' => $pendingLeave->description,
                    'document_url' => $pendingLeave->document_url,
                    'start_date' => $pendingLeave->start_date->format('Y-m-d'),
                    'end_date' => $pendingLeave->end_date->format('Y-m-d'),
                    'created_at' => $pendingLeave->created_at->toIso8601String(),
                ] : null,
                'consecutiveAbsences' => $consecutiveAlpaStreaks[$s->id] ?? 0,
            ];
        }

        $stats = $this->attendanceService->stats($schoolClass->id);

        $approvedLeavesMap = $approvedLeaves->map(fn ($l) => [
            'category' => $l->category,
            'start_date' => $l->start_date->format('Y-m-d'),
            'end_date' => $l->end_date->format('Y-m-d'),
            'description' => $l->description,
            'document_url' => $l->document_url,
            'guardian_name' => $l->guardian->name,
            'created_at' => $l->created_at->toIso8601String(),
            'updated_at' => $l->updated_at->toIso8601String(),
        ])->all();

        return Inertia::render('Teacher/HomeroomDashboard', [
            'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
            'class' => ['id' => $schoolClass->id, 'name' => $schoolClass->name],
            'students' => $studentsData,
            'stats' => $stats,
            'pendingLeaveCount' => $stats['pending_leave'],
            'expiredPendingCount' => $expiredPendingCount,
            'approvedLeaves' => $approvedLeavesMap,
            'lateThreshold' => $lateThreshold ? $lateThreshold->format('H:i') : null,
            'isSchoolDay' => true,
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
