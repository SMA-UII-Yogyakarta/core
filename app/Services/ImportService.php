<?php

namespace App\Services;

use App\Imports\StudentsImport;
use App\Imports\TeachersImport;
use Illuminate\Http\UploadedFile;

class ImportService
{
    public function importStudents(UploadedFile $file): array
    {
        $path = $file->store('imports');
        $fullPath = storage_path("app/{$path}");

        $importer = new StudentsImport();
        $result = $importer->import($fullPath);

        unlink($fullPath);

        return $result;
    }

    public function importTeachers(UploadedFile $file): array
    {
        $path = $file->store('imports');
        $fullPath = storage_path("app/{$path}");

        $importer = new TeachersImport();
        $result = $importer->import($fullPath);

        unlink($fullPath);

        return $result;
    }
}
