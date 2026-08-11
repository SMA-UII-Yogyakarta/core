<?php

namespace App\Http\Controllers\Api;

use App\Actions\GetStudentFromUser;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\StudentResource;
use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceApiController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
        protected GetStudentFromUser $getStudent,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Attendance::class);

        $attendances = $this->attendanceService->paginate(
            $request->only(['student_id', 'class_id', 'date', 'status']),
        );

        return ApiResponse::success(AttendanceResource::collection($attendances));
    }

    public function today(Request $request): JsonResponse
    {
        $student = $this->getStudent->handle($request->user());

        if (! $student) {
            return ApiResponse::notFound('Student not found.');
        }

        $today = now()->toDateString();
        $attendance = \App\Models\Attendance::where('student_id', $student->id)
            ->where('attendance_date', $today)
            ->first();

        return ApiResponse::success([
            'attendance' => $attendance ? new AttendanceResource($attendance) : null,
            'student' => new StudentResource($student->load('class')),
        ]);
    }

    public function checkIn(StoreAttendanceRequest $request): JsonResponse
    {
        $this->authorize('checkIn', Attendance::class);

        $student = $this->getStudent->handle($request->user());

        if (! $student) {
            return ApiResponse::notFound('Student not found.');
        }

        try {
            $data = $request->validated();
            if ($request->hasFile('photo')) {
                $data['photo'] = $request->file('photo');
            }
            $attendance = $this->attendanceService->checkIn($student->id, $data);

            return ApiResponse::success(
                new AttendanceResource($attendance),
                'Attendance recorded.',
                201,
            );
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), 403);
        }
    }

    public function history(Request $request): JsonResponse
    {
        $student = $this->getStudent->handle($request->user());

        if (! $student) {
            return ApiResponse::notFound('Student not found.');
        }

        $limit = $request->integer('limit', 30);
        $history = $this->attendanceService->history($student->id, $limit);

        return ApiResponse::success(AttendanceResource::collection($history));
    }

    public function stats(Request $request): JsonResponse
    {
        $request->validate([
            'class_id' => 'required|integer|exists:school_classes,id',
            'date' => 'nullable|date',
        ]);

        $stats = $this->attendanceService->stats(
            $request->integer('class_id'),
            $request->input('date'),
        );

        return ApiResponse::success($stats);
    }
}
