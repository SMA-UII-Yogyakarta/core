<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\SchoolClassService;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
        protected SchoolClassService $schoolClassService,
    ) {
    }

    public function monitoring()
    {
        $classId = request('class_id');
        $classes = $this->schoolClassService->findAll();

        $stats = null;
        $students = [];

        if ($classId) {
            $stats = $this->attendanceService->stats($classId);
            $students = $this->attendanceService->todayByClass($classId);
        }

        return Inertia::render('Admin/Monitoring', [
            'classes' => $classes,
            'selectedClassId' => $classId,
            'stats' => $stats,
            'students' => $students,
        ]);
    }
}
