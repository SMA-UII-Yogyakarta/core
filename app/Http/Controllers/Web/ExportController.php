<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\ExportService;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function __construct(
        protected ExportService $exportService,
    ) {
    }

    public function students()
    {
        $path = $this->exportService->studentsXlsx();
        return response()->download($path)->deleteFileAfterSend();
    }

    public function teachers()
    {
        $path = $this->exportService->teachersXlsx();
        return response()->download($path)->deleteFileAfterSend();
    }

    public function rekapHarian(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $date = $request->input('date', now()->toDateString());
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->rekapHarianXlsx($date, $classId);
        return response()->download($path)->deleteFileAfterSend();
    }

    public function rekapBulanan(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->rekapBulananXlsx($month, $year, $classId);
        return response()->download($path)->deleteFileAfterSend();
    }

    public function rekapHarianPdf(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $date = $request->input('date', now()->toDateString());
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->rekapHarianPdf($date, $classId);
        return response()->download($path, 'rekap-harian-' . $date . '.pdf')->deleteFileAfterSend();
    }

    public function rekapBulananPdf(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->rekapBulananPdf($month, $year, $classId);
        return response()->download($path, 'rekap-bulanan-' . $month . '-' . $year . '.pdf')->deleteFileAfterSend();
    }
}
