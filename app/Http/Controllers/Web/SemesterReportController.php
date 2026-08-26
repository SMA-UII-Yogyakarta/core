<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SemesterReportController extends Controller
{
    public function index(Request $request)
    {
        $request->query->set('period', 'semester');
        return app(ExportController::class)->index($request);
    }
}
