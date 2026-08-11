<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreLeaveRequestRequest;
use App\Http\Requests\Api\VerifyLeaveRequestRequest;
use App\Http\Resources\LeaveRequestResource;
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

        return ApiResponse::success(LeaveRequestResource::collection($leaveRequests));
    }

    public function store(StoreLeaveRequestRequest $request): JsonResponse
    {
        $this->authorize('create', LeaveRequest::class);

        $leaveRequest = $this->leaveRequestService->create($request->validated());

        return ApiResponse::success(
            new LeaveRequestResource($leaveRequest),
            'Leave request submitted.',
            201,
        );
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', LeaveRequest::class);

        $leaveRequest = $this->leaveRequestService->findById($id);
        if (! $leaveRequest) {
            return ApiResponse::notFound('Leave request not found.');
        }

        return ApiResponse::success(new LeaveRequestResource($leaveRequest));
    }

    public function verify(VerifyLeaveRequestRequest $request, int $id): JsonResponse
    {
        $this->authorize('verify', LeaveRequest::class);

        try {
            $leaveRequest = $this->leaveRequestService->verify(
                $id,
                $request->input('status'),
            );

            return ApiResponse::success(new LeaveRequestResource($leaveRequest));
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }
    }
}
