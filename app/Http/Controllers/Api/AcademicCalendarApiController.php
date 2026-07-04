<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAcademicCalendarRequest;
use App\Http\Requests\Api\UpdateAcademicCalendarRequest;
use App\Services\AcademicCalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicCalendarApiController extends Controller
{
    public function __construct(
        protected AcademicCalendarService $academicCalendarService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $calendars = $this->academicCalendarService->paginate(
            $request->only(['year', 'month', 'is_holiday']),
        );

        return response()->json($calendars);
    }

    public function all(): JsonResponse
    {
        return response()->json($this->academicCalendarService->findAll());
    }

    public function store(StoreAcademicCalendarRequest $request): JsonResponse
    {
        $calendar = $this->academicCalendarService->create($request->validated());
        return response()->json($calendar, 201);
    }

    public function show(int $id): JsonResponse
    {
        $calendar = \App\Models\AcademicCalendar::find($id);
        if (! $calendar) {
            return response()->json(['message' => 'Data kalender tidak ditemukan.'], 404);
        }
        return response()->json($calendar);
    }

    public function update(UpdateAcademicCalendarRequest $request, int $id): JsonResponse
    {
        $calendar = $this->academicCalendarService->update($id, $request->validated());
        return response()->json($calendar);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->academicCalendarService->delete($id);
        return response()->json(['message' => 'Data kalender berhasil dihapus.']);
    }
}
