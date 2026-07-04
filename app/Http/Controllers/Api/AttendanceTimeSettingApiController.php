<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BulkUpdateAttendanceTimeSettingsRequest;
use App\Services\AttendanceTimeSettingService;
use Illuminate\Http\JsonResponse;

class AttendanceTimeSettingApiController extends Controller
{
    public function __construct(
        protected AttendanceTimeSettingService $attendanceTimeSettingService,
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->attendanceTimeSettingService->findAll());
    }

    public function bulkUpdate(BulkUpdateAttendanceTimeSettingsRequest $request): JsonResponse
    {
        $this->attendanceTimeSettingService->bulkUpdate($request->input('settings'));
        return response()->json([
            'message' => 'Pengaturan waktu berhasil diperbarui.',
            'settings' => $this->attendanceTimeSettingService->findAll(),
        ]);
    }
}
