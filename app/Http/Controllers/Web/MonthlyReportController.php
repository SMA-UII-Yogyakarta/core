<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MonthlyReportController extends Controller
{
    public function index(Request $request)
    {
        $request->query->set('period', 'bulanan');
        return app(ExportController::class)->index($request);
    }
}
