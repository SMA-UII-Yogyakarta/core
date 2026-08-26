<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\Student;
use App\Services\HomeroomScope;
use App\Services\LeaveRequestService;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function __construct(
        protected LeaveRequestService $leaveRequestService,
        protected HomeroomScope $homeroomScope,
        protected TeacherService $teacherService,
    ) {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', LeaveRequest::class);

        $filters = $request->only(['status', 'category', 'search']);

        return Inertia::render('Admin/LeaveRequests', [
            'leaveRequests' => $this->leaveRequestService->paginate(
                $filters,
                20,
                $this->homeroomScope->classIds($request->user()),
            ),
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, int $id)
    {
        $leave = $this->leaveRequestService->findById($id);

        abort_unless($leave !== null, 404);

        $this->authorize('view', $leave);
        $this->homeroomScope->assertClassAllowed($request->user(), $leave->student->class_id);

        return redirect()->route('leave-requests.index');
    }

    public function verification(Request $request)
    {
        $this->authorize('verify', LeaveRequest::class);

        $user = $request->user();

        if ($user->role === 'teacher') {
            $teacher = $this->teacherService->findByUserId($user->id);
            $schoolClass = $teacher?->schoolClasses()->first();

            if (! $teacher || ! $schoolClass) {
                return Inertia::render('Teacher/LeaveVerification', [
                    'teacher' => $teacher ? ['id' => $teacher->id, 'name' => $teacher->name] : null,
                    'class' => null,
                    'leaveRequests' => [],
                ]);
            }

            $studentIds = Student::where('class_id', $schoolClass->id)
                ->where('status', 'Active')
                ->pluck('id');

            $leaveRequests = LeaveRequest::with(['student', 'guardian'])
                ->whereIn('student_id', $studentIds)
                ->latest()
                ->get()
                ->map(fn ($lr) => [
                    'id' => $lr->id,
                    'student' => [
                        'id' => $lr->student->id,
                        'name' => $lr->student->name,
                        'nis' => $lr->student->nis,
                        'nisn' => $lr->student->nisn,
                    ],
                    'guardian' => ['id' => $lr->guardian->id, 'name' => $lr->guardian->name],
                    'category' => $lr->category,
                    'start_date' => $lr->start_date->format('Y-m-d'),
                    'end_date' => $lr->end_date->format('Y-m-d'),
                    'description' => $lr->description,
                    'document_url' => $lr->document_url,
                    'approval_status' => $lr->approval_status,
                    'rejection_reason' => $lr->rejection_reason,
                    'created_at' => $lr->created_at->toIso8601String(),
                    'updated_at' => $lr->updated_at?->toIso8601String(),
                ]);

            return Inertia::render('Teacher/LeaveVerification', [
                'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
                'class' => ['id' => $schoolClass->id, 'name' => $schoolClass->name],
                'leaveRequests' => $leaveRequests,
            ]);
        }

        $filters = $request->only(['status', 'category']);

        return Inertia::render('Admin/LeaveVerification', [
            'leaveRequests' => $this->leaveRequestService->paginate(
                $filters,
                20,
                $this->homeroomScope->classIds($user),
            ),
            'filters' => $filters,
        ]);
    }

    public function approve(Request $request, int $id)
    {
        $this->authorize('verify', LeaveRequest::class);
        $this->assertInScope($request, $id);

        $this->leaveRequestService->verify($id, 'Approved');
        return redirect()->back();
    }

    public function reject(Request $request, int $id)
    {
        $this->authorize('verify', LeaveRequest::class);
        $this->assertInScope($request, $id);

        $reason = $request->input('rejection_reason');
        $this->leaveRequestService->verify($id, 'Rejected', $reason);
        return redirect()->back();
    }

    public function revert(Request $request, int $id)
    {
        $this->authorize('verify', LeaveRequest::class);
        $this->assertInScope($request, $id);

        $this->leaveRequestService->revert($id);
        return redirect()->back();
    }

    public function bulkVerify(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:leave_requests,id',
            'status' => 'required|string|in:Approved,Rejected',
        ]);

        $this->authorize('verify', LeaveRequest::class);

        $leaves = LeaveRequest::with('student')->whereIn('id', $validated['ids'])->get();
        foreach ($leaves as $leave) {
            $this->homeroomScope->assertClassAllowed($request->user(), $leave->student->class_id);
        }

        /** @var 'Approved'|'Rejected' $status */
        $status = $validated['status'];
        $count = $this->leaveRequestService->bulkVerify($validated['ids'], $status);

        $statusText = $status === 'Approved' ? 'disetujui' : 'ditolak';

        return redirect()->back()->with('success', $count . ' permohonan izin berhasil ' . $statusText . '.');
    }

    private function assertInScope(Request $request, int $id): void
    {
        $leave = $this->leaveRequestService->findById($id);

        abort_unless($leave !== null, 404);
        $this->homeroomScope->assertClassAllowed($request->user(), $leave->student->class_id);
    }
}
