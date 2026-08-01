<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreLeaveRequestRequest;
use App\Http\Requests\Api\VerifyLeaveRequestRequest;
use App\Models\LeaveRequest;
use App\Services\LeaveRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveRequestApiController extends Controller
{
    public function __construct(
        protected LeaveRequestService $leaveRequestService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', LeaveRequest::class);

        $leaveRequests = $this->leaveRequestService->paginate(
            $request->only(['student_id', 'guardian_id', 'status', 'category']),
        );

        return response()->json($leaveRequests);
    }

    public function store(StoreLeaveRequestRequest $request): JsonResponse
    {
        $this->authorize('create', LeaveRequest::class);

        $leaveRequest = $this->leaveRequestService->create($request->validated());
        return response()->json($leaveRequest, 201);
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', LeaveRequest::class);

        $leaveRequest = $this->leaveRequestService->findById($id);
        if (! $leaveRequest) {
            return response()->json(['message' => 'Leave request not found.'], 404);
        }
        return response()->json($leaveRequest);
    }

    public function verify(VerifyLeaveRequestRequest $request, int $id): JsonResponse
    {
        $this->authorize('verify', LeaveRequest::class);

        try {
            $leaveRequest = $this->leaveRequestService->verify(
                $id,
                $request->input('status'),
            );
            return response()->json($leaveRequest);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
