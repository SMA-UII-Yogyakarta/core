<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\LeaveRequestService;
use Inertia\Inertia;

class LeaveRequestController extends Controller
{
    public function __construct(
        protected LeaveRequestService $leaveRequestService,
    ) {
    }

    public function index()
    {
        $leaves = $this->leaveRequestService->paginate(
            request()->only(['status', 'category', 'search']),
        );

        return Inertia::render('Admin/LeaveRequests', [
            'leaveRequests' => $leaves,
            'filters' => request()->only(['status', 'category', 'search']),
        ]);
    }

    public function show(int $id)
    {
        $leave = $this->leaveRequestService->findById($id);

        return Inertia::render('Admin/LeaveRequests', [
            'leaveRequests' => $leave,
            'filters' => request()->only(['status', 'category', 'search']),
        ]);
    }

    public function verification()
    {
        $leaves = $this->leaveRequestService->paginate(
            request()->only(['status', 'category']),
        );

        return Inertia::render('Admin/LeaveVerification', [
            'leaveRequests' => $leaves,
            'filters' => request()->only(['status', 'category']),
        ]);
    }

    public function approve(int $id)
    {
        $this->leaveRequestService->verify($id, 'Approved');
        return redirect()->back()->with('success', 'Leave request approved.');
    }

    public function reject(int $id)
    {
        $this->leaveRequestService->verify($id, 'Rejected');
        return redirect()->back()->with('success', 'Leave request rejected.');
    }

    public function bulkVerify(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:leave_requests,id',
            'status' => 'required|string|in:Approved,Rejected',
        ]);

        /** @var 'Approved'|'Rejected' $status */
        $status = $validated['status'];
        $count = $this->leaveRequestService->bulkVerify($validated['ids'], $status);

        $statusText = $status === 'Approved' ? 'disetujui' : 'ditolak';

        return redirect()->back()->with('success', $count . ' permohonan izin berhasil ' . $statusText . '.');
    }
}
