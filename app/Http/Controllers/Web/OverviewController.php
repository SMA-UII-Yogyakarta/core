<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OverviewController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
    ) {
    }

    public function index(Request $request)
    {
        $date = $request->query('date', now()->toDateString());

        $overview = $this->analyticsService->schoolOverview($date);
        $monthlyTrend = $this->analyticsService->monthlyTrend();
        $weeklyTrend = $this->analyticsService->weeklyTrend();

        return Inertia::render('Admin/Overview', [
            'overview' => $overview,
            'monthlyTrend' => $monthlyTrend,
            'weeklyTrend' => $weeklyTrend,
            'selectedDate' => $date,
        ]);
    }
}
