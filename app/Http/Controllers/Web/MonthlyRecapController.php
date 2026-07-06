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
        $month = request('bulan', now()->month);
        $year = request('tahun', now()->year);
        $classId = request('class_id');

        $classes = $this->schoolClassService->findAll();

        $dailyData = [];
        if ($classId) {
            $dailyData = $this->attendanceService->getMonthlyDaily($classId, $month, $year);
        }

        return Inertia::render('Admin/RekapBulanan', [
            'classes' => $classes,
            'selectedClassId' => $classId,
            'bulan' => (int) $month,
            'tahun' => (int) $year,
            'dailyData' => $dailyData,
        ]);
    }
}
