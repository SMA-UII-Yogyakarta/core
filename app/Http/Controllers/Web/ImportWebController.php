<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\ImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportWebController extends Controller
{
    public function __construct(
        protected ImportService $importService,
    ) {
    }

    public function import(Request $request, string $entity): JsonResponse
    {
        $this->authorize('create', \App\Models\Student::class);

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        if (! $file) {
            return response()->json([
                'success_count' => 0,
                'error_count' => 1,
                'errors' => ['File tidak ditemukan.'],
                'success' => [],
            ], 400);
        }

        $result = match ($entity) {
            'students' => $this->importService->importStudents($file),
            'teachers' => $this->importService->importTeachers($file),
            'classes' => $this->importService->importClasses($file),
            'guardians' => $this->importService->importGuardians($file),
            default => [
                'success_count' => 0,
                'error_count' => 1,
                'errors' => ["Entitas import '{$entity}' tidak dikenali."],
                'success' => [],
            ],
        };

        return response()->json($result);
    }

    public function template(string $entity): StreamedResponse
    {
        $csvContent = $this->importService->generateTemplateCsv($entity);
        $filename = "template_import_{$entity}.csv";

        return response()->streamDownload(function () use ($csvContent) {
            echo $csvContent;
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
