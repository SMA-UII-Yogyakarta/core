<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Services\HomeroomScope;
use App\Services\LeaveRequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function __construct(
        protected LeaveRequestService $leaveRequestService,
        protected HomeroomScope $homeroomScope,
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

        $filters = $request->only(['status', 'category']);

        return Inertia::render('Admin/LeaveVerification', [
            'leaveRequests' => $this->leaveRequestService->paginate(
                $filters,
                20,
                $this->homeroomScope->classIds($request->user()),
            ),
            'filters' => $filters,
        ]);
    }

    public function approve(Request $request, int $id)
    {
        $this->authorize('verify', LeaveRequest::class);
        $this->assertInScope($request, $id);

        $this->leaveRequestService->verify($id, 'Approved');
        return redirect()->back()->with('success', 'Leave request approved.');
    }

    public function reject(Request $request, int $id)
    {
        $this->authorize('verify', LeaveRequest::class);
        $this->assertInScope($request, $id);

        $this->leaveRequestService->verify($id, 'Rejected');
        return redirect()->back()->with('success', 'Leave request rejected.');
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
