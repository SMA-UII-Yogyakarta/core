<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExportController extends Controller
{
    public function __construct(
        protected ExportService $exportService,
    ) {
    }

    public function index(Request $request)
    {
        $period = in_array($request->query('period'), ['harian', 'bulanan', 'semester'], true)
            ? $request->query('period')
            : 'bulanan';
        $date = $request->query('date', now()->toDateString());
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);
        $semester = (int) $request->query('semester', now()->month <= 6 ? 1 : 2);
        $classId = $request->integer('class_id') ?: null;

        $classes = SchoolClass::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Reports/Export', [
            'classes' => $classes,
            'preview' => $this->exportService->previewData($period, $date, $month, $year, $semester, $classId),
            'selectedPeriod' => $period,
            'selectedDate' => $date,
            'selectedMonth' => $month,
            'selectedYear' => $year,
            'selectedSemester' => $semester,
            'selectedClassId' => $classId,
        ]);
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

    public function dailyRecap(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $date = $request->input('date', now()->toDateString());
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->dailyRecapXlsx($date, $classId);
        return response()->download($path)->deleteFileAfterSend();
    }

    public function monthlyRecap(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->monthlyRecapXlsx($month, $year, $classId);
        return response()->download($path)->deleteFileAfterSend();
    }

    public function dailyRecapPdf(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $date = $request->input('date', now()->toDateString());
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->dailyRecapPdf($date, $classId);
        return response()->download($path, 'daily-recap-' . $date . '.pdf')->deleteFileAfterSend();
    }

    public function monthlyRecapPdf(Request $request)
    {
        $request->validate([
            'month' => 'nullable|integer|between:1,12',
            'year' => 'nullable|integer|min:2020',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->monthlyRecapPdf($month, $year, $classId);
        return response()->download($path, 'monthly-recap-' . $month . '-' . $year . '.pdf')->deleteFileAfterSend();
    }

    public function semesterRecap(Request $request)
    {
        $request->validate([
            'semester' => 'nullable|integer|between:1,2',
            'year' => 'nullable|integer|min:2020',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $semester = $request->integer('semester', now()->month <= 6 ? 1 : 2);
        $year = $request->integer('year', now()->year);
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->semesterRecapXlsx($semester, $year, $classId);
        return response()->download($path, 'semester-recap-' . $year . '-s' . $semester . '.xlsx')->deleteFileAfterSend();
    }

    public function semesterRecapPdf(Request $request)
    {
        $request->validate([
            'semester' => 'nullable|integer|between:1,2',
            'year' => 'nullable|integer|min:2020',
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $semester = $request->integer('semester', now()->month <= 6 ? 1 : 2);
        $year = $request->integer('year', now()->year);
        $classId = $request->integer('class_id') ?: null;

        $path = $this->exportService->semesterRecapPdf($semester, $year, $classId);
        return response()->download($path, 'semester-recap-' . $year . '-s' . $semester . '.pdf')->deleteFileAfterSend();
    }
}
