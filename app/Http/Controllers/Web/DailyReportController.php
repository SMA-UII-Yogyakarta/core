<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\HomeroomScope;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyReportController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
        protected HomeroomScope $homeroomScope,
    ) {
    }

    public function index(Request $request)
    {
        $date = $request->query('date', now()->toDateString());
        $classId = $request->integer('class_id') ?: null;

        $this->homeroomScope->assertClassAllowed($request->user(), $classId);

        $overview = $this->analyticsService->schoolOverview($date);
        $classDetail = $classId ? $this->analyticsService->classDetail($classId, (string) $date) : null;
        $classes = $this->homeroomScope->classesFor($request->user());

        return Inertia::render('Reports/Daily', [
            'overview' => $overview,
            'classDetail' => $classDetail,
            'classes' => $classes,
            'selectedDate' => $date,
            'selectedClassId' => $classId,
        ]);
    }
}
