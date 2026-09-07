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
    public function importStudents(UploadedFile $file, ?string $defaultPassword = null): array
    {
        $path = $file->store('imports', 'local');
        $fullPath = Storage::disk('local')->path($path);

        $importer = new StudentsImport($defaultPassword);
        $result = $importer->import($fullPath);

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }

        return $result;
    }

    public function importTeachers(UploadedFile $file, ?string $defaultPassword = null): array
    {
        $path = $file->store('imports', 'local');
        $fullPath = Storage::disk('local')->path($path);

        $importer = new TeachersImport($defaultPassword);
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

    public function importGuardians(UploadedFile $file, ?string $defaultPassword = null): array
    {
        $path = $file->store('imports', 'local');
        $fullPath = Storage::disk('local')->path($path);

        $importer = new GuardiansImport($defaultPassword);
        $result = $importer->import($fullPath);

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }

        return $result;
    }

    public function generateTemplateCsv(string $entity): string
    {
        return match ($entity) {
            'students' => "nis,nisn,name,class,birth_date,phone,address,enrollment_year,email,password\n2716,0009123456,ABIMANYU PANDITA PRABASWARA,X-1,2010-05-12,081234567890,Jl. Kaliurang KM 10,2026,abimanyu2716@smauiiyk.sch.id,SmaUii@2026\n",
            'teachers' => "teacher_code,name,email,teacher_type,password\nTCH-001,AHMAD HANIF HASAN ROSYIDI, S.Kom,hanif@smauiiyk.sch.id,homeroom,SmaUii@2026\n",
            'classes' => "name,level,academic_year,capacity,teacher_code\nX-1,X,2026/2027,36,TCH-001\n",
            'guardians' => "name,phone,address,email,username,password\nBambang Suherman,081298765432,Jl. Kaliurang KM 9,bambang@gmail.com,081298765432,SmaUii@2026\n",
            default => "name\nContoh Data\n",
        };
    }
}
