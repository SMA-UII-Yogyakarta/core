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
}
