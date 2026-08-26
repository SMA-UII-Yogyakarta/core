<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DailyReportController extends Controller
{
    public function index(Request $request)
    {
        $request->query->set('period', 'harian');
        return app(ExportController::class)->index($request);
    }
}
