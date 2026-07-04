<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\DutyScheduleService;
use Illuminate\Http\Request;

class DutyScheduleController extends Controller
{
    public function __construct(
        protected DutyScheduleService $dutyScheduleService,
    ) {
    }

    public function index()
    {
        $schedules = $this->dutyScheduleService->findAll();

        return inertia('Admin/DutySchedule', [
            'schedules' => $schedules,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'duty_day' => 'required|string|max:20',
        ]);

        $schedule = $this->dutyScheduleService->create($validated);

        return redirect()->back()->with('success', 'Jadwal piket berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'duty_day' => 'required|string|max:20',
        ]);

        $this->dutyScheduleService->update($id, $validated);

        return redirect()->back()->with('success', 'Jadwal piket berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $this->dutyScheduleService->delete($id);

        return redirect()->back()->with('success', 'Jadwal piket berhasil dihapus.');
    }
}
