<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyReportController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
    ) {
    }

    public function index(Request $request)
    {
        $date = $request->query('date', now()->toDateString());
        $classId = $request->query('class_id');

        $overview = $this->analyticsService->schoolOverview($date);
        $classDetail = $classId ? $this->analyticsService->classDetail((int) $classId, $date) : null;
        $classes = \App\Models\SchoolClass::select('id', 'name')->get();

        return Inertia::render('Reports/Daily', [
            'overview' => $overview,
            'classDetail' => $classDetail,
            'classes' => $classes,
            'selectedDate' => $date,
            'selectedClassId' => $classId ? (int) $classId : null,
        ]);
    }
}
