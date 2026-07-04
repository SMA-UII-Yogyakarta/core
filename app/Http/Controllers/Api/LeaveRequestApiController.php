<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreLeaveRequestRequest;
use App\Http\Requests\Api\VerifyLeaveRequestRequest;
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
        $leaveRequests = $this->leaveRequestService->paginate(
            $request->only(['student_id', 'guardian_id', 'status', 'category']),
        );

        return response()->json($leaveRequests);
    }

    public function store(StoreLeaveRequestRequest $request): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->create($request->validated());
        return response()->json($leaveRequest, 201);
    }

    public function show(int $id): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->findById($id);
        if (! $leaveRequest) {
            return response()->json(['message' => 'Pengajuan izin tidak ditemukan.'], 404);
        }
        return response()->json($leaveRequest);
    }

    public function verify(VerifyLeaveRequestRequest $request, int $id): JsonResponse
    {
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
