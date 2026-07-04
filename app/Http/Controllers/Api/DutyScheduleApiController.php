<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreDutyScheduleRequest;
use App\Http\Requests\Api\UpdateDutyScheduleRequest;
use App\Models\DutySchedule;
use App\Services\DutyScheduleService;
use Illuminate\Http\JsonResponse;

class DutyScheduleApiController extends Controller
{
    public function __construct(
        protected DutyScheduleService $dutyScheduleService,
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->dutyScheduleService->findAll());
    }

    public function store(StoreDutyScheduleRequest $request): JsonResponse
    {
        $schedule = $this->dutyScheduleService->create($request->validated());
        return response()->json($schedule, 201);
    }

    public function show(int $id): JsonResponse
    {
        $schedule = DutySchedule::with('teacher')->find($id);
        if (! $schedule) {
            return response()->json(['message' => 'Jadwal piket tidak ditemukan.'], 404);
        }
        return response()->json($schedule);
    }

    public function update(UpdateDutyScheduleRequest $request, int $id): JsonResponse
    {
        $schedule = $this->dutyScheduleService->update($id, $request->validated());
        return response()->json($schedule);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->dutyScheduleService->delete($id);
        return response()->json(['message' => 'Jadwal piket berhasil dihapus.']);
    }
}
