<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Services\AttendanceOverrideService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceOverrideController extends Controller
{
    public function __construct(
        protected AttendanceOverrideService $overrideService,
    ) {
    }

    public function index(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $date = $request->input('date', now()->toDateString());
        $classId = $request->integer('class_id') ?: null;

        $students = $this->overrideService->findByDate($classId, $date);
        $classes = SchoolClass::orderBy('name')->get();

        return Inertia::render('Attendance/AttendanceCorrection', [
            'students' => $students,
            'classes' => $classes,
            'filters' => [
                'date' => $date,
                'class_id' => $classId,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|integer|exists:students,id',
            'date' => 'required|date',
            'new_status' => 'required|in:Present,Late,Absent,Sick,Permit',
            'reason' => 'required|string|max:500',
        ]);

        $this->overrideService->override(
            studentId: $validated['student_id'],
            userId: $request->user()->id,
            date: $validated['date'],
            newStatus: $validated['new_status'],
            reason: $validated['reason'],
        );

        return redirect()->back()->with('success', 'Attendance status updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->overrideService->deleteOverride($id);
        return redirect()->back()->with('success', 'Override deleted successfully.');
    }
}
