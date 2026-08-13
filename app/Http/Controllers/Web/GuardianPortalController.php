<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Services\AnalyticsService;
use App\Services\AttendanceService;
use App\Services\GuardianService;
use App\Services\LeaveRequestService;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuardianPortalController extends Controller
{
    public function __construct(
        protected GuardianService $guardianService,
        protected LeaveRequestService $leaveRequestService,
        protected AnalyticsService $analyticsService,
        protected AttendanceService $attendanceService,
        protected StorageService $storageService,
    ) {
    }

    public function dashboard(Request $request)
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->route('dashboard')->with('error', 'Guardian data not found.');
        }

        $students = $guardian->students()->with('class')->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'class' => $s->class ? ['id' => $s->class->id, 'name' => $s->class->name] : null,
            'nis' => $s->nis,
        ]);

        // Auto-select first student if none provided
        $firstStudent = $students->first();
        $selectedStudentId = $request->integer('student_id') ?: ($firstStudent['id'] ?? null);
        $selectedStudent = $students->firstWhere('id', $selectedStudentId);

        // Today attendance for selected student
        $todayAttendance = null;
        if ($selectedStudentId) {
            $att = Attendance::where('student_id', $selectedStudentId)
                ->where('attendance_date', now()->toDateString())
                ->first();
            if ($att) {
                $todayAttendance = [
                    'id' => $att->id,
                    'status' => $att->status,
                    'check_in_time' => $att->check_in_time,
                    'attendance_date' => $att->attendance_date->toDateString(),
                ];
            }
        }

        // Semester stats for selected student (current year)
        $semesterStats = null;
        if ($selectedStudentId) {
            $year = now()->year;
            $counts = Attendance::where('student_id', $selectedStudentId)
                ->whereYear('attendance_date', $year)
                ->toBase()
                ->selectRaw("
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN status = 'Late'    THEN 1 ELSE 0 END) as late
                ")
                ->first();

            $sickPermit = LeaveRequest::where('student_id', $selectedStudentId)
                ->where('approval_status', 'Approved')
                ->whereYear('start_date', $year)
                ->count();

            $total = (int) ($counts->total ?? 0);
            $present = (int) ($counts->present ?? 0);
            $late = (int) ($counts->late ?? 0);

            $semesterStats = [
                'present' => $present + $late, // hadir = tepat + terlambat
                'sick_permit' => $sickPermit,
                'absent' => max(0, $total - $present - $late),
            ];
        }

        return Inertia::render('Guardian/Dashboard', [
            'guardian' => ['id' => $guardian->id, 'name' => $guardian->name],
            'students' => $students,
            'selectedStudentId' => $selectedStudentId,
            'selectedStudent' => $selectedStudent,
            'todayAttendance' => $todayAttendance,
            'semesterStats' => $semesterStats,
        ]);
    }

    public function leaveApplication()
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->route('dashboard')->with('error', 'Guardian data not found.');
        }

        $students = $guardian->students()->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
        ]);

        $leaveRequests = $this->leaveRequestService->paginate(['guardian_id' => $guardian->id]);

        return Inertia::render('Guardian/LeaveApplication', [
            'guardian' => [
                'id' => $guardian->id,
                'name' => $guardian->name,
                'students' => $students,
            ],
            'students' => $students,
            'leaveRequests' => $leaveRequests->toArray(),
        ]);
    }

    public function storeLeaveApplication(Request $request)
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->back()->with('error', 'Guardian data not found.');
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'category' => 'required|in:Sick,Event,Competition,Other',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:500',
            'document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if (! $guardian->students()->whereKey($validated['student_id'])->exists()) {
            return redirect()->back()
                ->withErrors(['student_id' => 'Siswa tidak terhubung ke akun ini.'])
                ->withInput();
        }

        $documentUrl = null;
        if ($request->hasFile('document')) {
            $documentUrl = $this->storageService->uploadDocument(
                $request->file('document'),
                'leave-documents',
            );
        }

        $this->leaveRequestService->create([
            'student_id' => $validated['student_id'],
            'guardian_id' => $guardian->id,
            'category' => $validated['category'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? $validated['start_date'],
            'description' => $validated['description'] ?? null,
            'document_url' => $documentUrl,
        ]);

        return redirect()->route('guardian.leave-application')
            ->with('success', 'Leave application submitted successfully.');
    }

    public function history(Request $request)
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->route('dashboard')->with('error', 'Guardian data not found.');
        }

        $students = $guardian->students()->with('class')->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'nis' => $s->nis,
            'class' => $s->class ? ['id' => $s->class->id, 'name' => $s->class->name] : null,
        ]);

        $studentIds = $students->pluck('id');

        $selectedStudentId = $request->integer('student_id');
        if ($selectedStudentId && ! $studentIds->contains($selectedStudentId)) {
            $selectedStudentId = 0;
        }
        $selectedStudentId = $selectedStudentId ?: $studentIds->first() ?: 0;

        $month = (int) $request->integer('month', now()->month);
        $year = (int) $request->integer('year', now()->year);

        $attendances = [];
        $stats = null;
        $monthlyTrend = null;
        $selectedStudent = null;
        $leaveRequests = [];

        if ($selectedStudentId) {
            $selectedStudent = $students->firstWhere('id', $selectedStudentId);
            $attendances = $this->attendanceService->history($selectedStudentId, 30, $month, $year)->items();
            $stats = $this->attendanceService->getStudentStats($selectedStudentId, $month, $year);
            $monthlyTrend = $this->analyticsService->studentMonthlyTrend($selectedStudentId);
            $leaveRequests = LeaveRequest::where('student_id', $selectedStudentId)
                ->latest()
                ->get()
                ->toArray();
        }

        return Inertia::render('Guardian/History', [
            'guardian' => ['id' => $guardian->id, 'name' => $guardian->name],
            'students' => $students,
            'selectedStudentId' => $selectedStudentId,
            'selectedStudent' => $selectedStudent,
            'attendances' => $attendances,
            'leaveRequests' => $leaveRequests,
            'month' => $month,
            'year' => $year,
            'stats' => $stats,
            'monthlyTrend' => $monthlyTrend,
        ]);
    }
}
