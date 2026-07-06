<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\SchoolClassService;
use Inertia\Inertia;

class MonthlyRecapController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
        protected SchoolClassService $schoolClassService,
    ) {
    }

    public function index()
    {
        $month = request('month', now()->month);
        $year = request('year', now()->year);
        $classId = request('class_id');

        $classes = $this->schoolClassService->findAll();

        $dailyData = [];
        if ($classId) {
            $dailyData = $this->attendanceService->getMonthlyDaily($classId, $month, $year);
        }

        return Inertia::render('Admin/MonthlyRecap', [
            'classes' => $classes,
            'selectedClassId' => $classId,
            'month' => (int) $month,
            'year' => (int) $year,
            'dailyData' => $dailyData,
        ]);
    }
}
