<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\LeaveRequestService;
use App\Services\SchoolClassService;
use Inertia\Inertia;

class LeaveRequestViewController extends Controller
{
    public function __construct(
        protected LeaveRequestService $leaveRequestService,
        protected SchoolClassService $schoolClassService,
    ) {
    }

    public function index()
    {
        $filters = request()->only(['status', 'category', 'search']);
        $leaveRequests = $this->leaveRequestService->paginate($filters, 15);
        $classes = $this->schoolClassService->findAll();

        return Inertia::render('Admin/LeaveRequests', [
            'leaveRequests' => $leaveRequests,
            'classes' => $classes,
            'filters' => $filters,
        ]);
    }
}
