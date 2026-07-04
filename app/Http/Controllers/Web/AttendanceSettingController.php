<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AcademicCalendarService;
use App\Services\AttendanceTimeSettingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceSettingController extends Controller
{
    public function __construct(
        protected AttendanceTimeSettingService $timeSettingService,
        protected AcademicCalendarService $academicCalendarService,
    ) {
    }

    public function index()
    {
        $timeSettings = $this->timeSettingService->findAll();
        $holidays = $this->academicCalendarService->paginate(
            request()->only(['year', 'month']),
        );

        return Inertia::render('Admin/AturWaktuLibur', [
            'timeSettings' => $timeSettings,
            'holidays' => $holidays,
            'filters' => request()->only(['year', 'month']),
        ]);
    }

    public function updateTimeSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.day' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'settings.*.check_in_open' => 'required|date_format:H:i',
            'settings.*.late_threshold' => 'required|date_format:H:i',
            'settings.*.check_in_close' => 'required|date_format:H:i',
        ]);

        $this->timeSettingService->bulkUpdate($validated['settings']);
        return redirect()->back()->with('success', 'Pengaturan waktu berhasil disimpan.');
    }

    public function storeHoliday(Request $request)
    {
        $validated = $request->validate([
            'holiday_date' => 'required|date|unique:academic_calendars,holiday_date',
            'description' => 'nullable|string|max:200',
        ]);

        $this->academicCalendarService->create($validated);
        return redirect()->back()->with('success', 'Hari libur berhasil ditambahkan.');
    }

    public function deleteHoliday(int $id)
    {
        $this->academicCalendarService->delete($id);
        return redirect()->back()->with('success', 'Hari libur berhasil dihapus.');
    }
}
