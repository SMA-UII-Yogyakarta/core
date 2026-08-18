<?php

namespace App\Services;

use App\Imports\GuardiansImport;
use App\Imports\SchoolClassesImport;
use App\Imports\StudentsImport;
use App\Imports\TeachersImport;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImportService
{
    public function importStudents(UploadedFile $file): array
    {
        $path = $file->store('imports', 'local');
        $fullPath = Storage::disk('local')->path($path);

        $importer = new StudentsImport();
        $result = $importer->import($fullPath);

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }

        return $result;
    }

    public function importTeachers(UploadedFile $file): array
    {
        $path = $file->store('imports', 'local');
        $fullPath = Storage::disk('local')->path($path);

        $importer = new TeachersImport();
        $result = $importer->import($fullPath);

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }

        return $result;
    }

    public function importClasses(UploadedFile $file): array
    {
        $path = $file->store('imports', 'local');
        $fullPath = Storage::disk('local')->path($path);

        $importer = new SchoolClassesImport();
        $result = $importer->import($fullPath);

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }

        return $result;
    }

    public function importGuardians(UploadedFile $file): array
    {
        $path = $file->store('imports', 'local');
        $fullPath = Storage::disk('local')->path($path);

        $importer = new GuardiansImport();
        $result = $importer->import($fullPath);

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }

        return $result;
    }

    public function generateTemplateCsv(string $entity): string
    {
        return match ($entity) {
            'students' => "nis,nisn,name,class,birth_date,phone,address,enrollment_year,email\n24250901,0009123456,Muhammad Rizky Pratama,X-A (Fase E - 1),2009-05-12,081234567890,Jl. Kaliurang KM 10,2024,rizky@siswa.smauii.sch.id\n",
            'teachers' => "teacher_code,name,email\nTCH-099,Drs. H. Mulyono, M.Pd.,mulyono@smauii.sch.id\n",
            'classes' => "name,level,capacity,teacher_code\nX-D (Fase E - 4),X,36,TCH-001\n",
            'guardians' => "name,phone,address,email\nBambang Suherman,081298765432,Jl. Sorowajan Baru No. 8,bambang@wali.smauii.sch.id\n",
            default => "name\nContoh Data\n",
        };
    }
}
