<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAttendanceRequest;
use App\Models\Student;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceApiController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $attendances = $this->attendanceService->paginate(
            $request->only(['student_id', 'class_id', 'date', 'status']),
        );

        return response()->json($attendances);
    }

    public function today(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (! $student) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        $today = now()->toDateString();
        $attendance = \App\Models\Attendance::where('student_id', $student->id)
            ->where('attendance_date', $today)
            ->first();

        return response()->json([
            'attendance' => $attendance,
            'student' => $student->load('class'),
        ]);
    }

    public function checkIn(StoreAttendanceRequest $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (! $student) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        try {
            $attendance = $this->attendanceService->checkIn($student->id, $request->validated());
            return response()->json($attendance, 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (! $student) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        $limit = $request->integer('limit', 30);
        $history = $this->attendanceService->history($student->id, $limit);

        return response()->json($history);
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

        return response()->json($stats);
    }
}
