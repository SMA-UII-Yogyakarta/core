<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\SchoolClassService;
use Inertia\Inertia;

class DailyRecapController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
        protected SchoolClassService $schoolClassService,
    ) {
    }

    public function index()
    {
        $date = request('date', now()->toDateString());
        $classId = request('class_id');

        $classes = $this->schoolClassService->findAll();

        $students = [];
        $stats = null;
        if ($classId) {
            $stats = $this->attendanceService->stats($classId, $date);
            $students = $this->attendanceService->todayByClass($classId);
        }

        $parsedDate = $date;

        return Inertia::render('Admin/DailyRecap', [
            'classes' => $classes,
            'selectedClassId' => $classId,
            'date' => $parsedDate,
            'stats' => $stats,
            'students' => $students,
        ]);
    }
}
