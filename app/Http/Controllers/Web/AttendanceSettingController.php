<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SchoolLocationSetting;
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
        $locationSetting = SchoolLocationSetting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'SMA UII Yogyakarta',
                'address' => 'Jl. Taman Siswa No.158, Wirogunan, Kec. Mergangsan, Kota Yogyakarta, D.I. Yogyakarta 55151',
                'latitude' => -7.814257,
                'longitude' => 110.375944,
                'radius_meters' => 100,
                'is_active' => true,
            ],
        );

        return Inertia::render('Admin/HolidaySettings', [
            'timeSettings' => $timeSettings,
            'holidays' => $holidays,
            'locationSetting' => $locationSetting,
            'filters' => request()->only(['year', 'month']),
        ]);
    }

    public function updateTimeSettings(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.day' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'settings.*.check_in_open' => 'required|date_format:H:i',
            'settings.*.late_threshold' => 'required|date_format:H:i',
            'settings.*.check_in_close' => 'required|date_format:H:i',
            'settings.*.is_active' => 'sometimes|boolean',
        ]);

        $this->timeSettingService->bulkUpdate($validated['settings']);
        return redirect()->back()->with('success', 'Time settings saved successfully.');
    }

    public function updateLocationSettings(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:10|max:5000',
            'is_active' => 'sometimes|boolean',
        ]);

        SchoolLocationSetting::updateOrCreate(
            ['id' => 1],
            $validated,
        );

        return redirect()->back()->with('success', 'Pengaturan titik lokasi presensi & geofence berhasil diperbarui.');
    }

    public function storeHoliday(Request $request)
    {
        $validated = $request->validate([
            'holiday_date' => 'required|date|unique:academic_calendars,holiday_date',
            'description' => 'nullable|string|max:200',
        ]);

        $this->academicCalendarService->create($validated);
        return redirect()->back()->with('success', 'Holiday added successfully.');
    }

    public function deleteHoliday(int $id)
    {
        $this->academicCalendarService->delete($id);
        return redirect()->back()->with('success', 'Holiday deleted successfully.');
    }
}
