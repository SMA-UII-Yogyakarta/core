<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Services\AnalyticsService;
use App\Services\GuardianService;
use App\Services\LeaveRequestService;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuardianWebController extends Controller
{
    public function __construct(
        protected GuardianService $guardianService,
        protected LeaveRequestService $leaveRequestService,
        protected AnalyticsService $analyticsService,
        protected StorageService $storageService,
    ) {
    }

    public function dashboard(Request $request)
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->route('dashboard')->with('error', 'Data wali murid tidak ditemukan.');
        }

        $students = $guardian->students()->with('class')->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'class' => $s->class ? ['id' => $s->class->id, 'name' => $s->class->name] : null,
            'nis' => $s->nis,
        ]);

        $selectedStudentId = $request->integer('student_id');
        $selectedStudent = null;
        $studentStats = null;
        $monthlyTrend = null;
        $recentHistory = [];

        if ($selectedStudentId && $guardian->students()->where('id', $selectedStudentId)->exists()) {
            $selectedStudent = $students->firstWhere('id', $selectedStudentId);
            $studentStats = $this->analyticsService->studentDetail($selectedStudentId);
            $monthlyTrend = $this->analyticsService->studentMonthlyTrend($selectedStudentId);
            $recentHistory = Attendance::where('student_id', $selectedStudentId)
                ->latest('attendance_date')
                ->take(10)
                ->get()
                ->toArray();
        }

        $allStats = null;
        if ($students->isNotEmpty()) {
            $studentIds = $students->pluck('id');
            $totalDays = Attendance::whereIn('student_id', $studentIds)->count();
            $present = Attendance::whereIn('student_id', $studentIds)->where('status', 'Present')->count();
            $late = Attendance::whereIn('student_id', $studentIds)->where('status', 'Late')->count();

            $allStats = [
                'total_hari' => $totalDays,
                'hadir' => $present,
                'terlambat' => $late,
                'alpa' => max(0, $totalDays - $present - $late),
                'izin_pending' => LeaveRequest::whereIn('student_id', $studentIds)
                    ->where('approval_status', 'Pending')->count(),
            ];
        }

        $recentLeaves = LeaveRequest::where('guardian_id', $guardian->id)
            ->with('student')
            ->latest()
            ->take(5)
            ->get()
            ->toArray();

        return Inertia::render('Guardian/Dashboard', [
            'guardian' => ['id' => $guardian->id, 'name' => $guardian->name],
            'students' => $students,
            'stats' => $allStats,
            'recentLeaves' => $recentLeaves,
            'selectedStudentId' => $selectedStudentId,
            'selectedStudent' => $selectedStudent,
            'studentStats' => $studentStats,
            'monthlyTrend' => $monthlyTrend,
            'recentHistory' => $recentHistory,
        ]);
    }

    public function leaveApplication()
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->route('dashboard')->with('error', 'Data wali murid tidak ditemukan.');
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
            return redirect()->back()->with('error', 'Data wali murid tidak ditemukan.');
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'category' => 'required|in:Sick,Permission,Other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:500',
            'document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

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
            'end_date' => $validated['end_date'],
            'document_url' => $documentUrl,
        ]);

        return redirect()->route('guardian.leave-application')
            ->with('success', 'Pengajuan izin berhasil dikirim.');
    }
}
