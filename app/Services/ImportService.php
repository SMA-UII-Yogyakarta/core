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
    /**
     * Store the uploaded import file temporarily, execute the callback, and guarantee file cleanup.
     *
     * @template T
     * @param \Closure(string): T $callback
     * @return T
     */
    protected function withStoredFile(UploadedFile $file, \Closure $callback): mixed
    {
        $path = $file->store('imports', 'local');
        $fullPath = Storage::disk('local')->path($path);

        try {
            return $callback($fullPath);
        } finally {
            if (Storage::disk('local')->exists($path)) {
                Storage::disk('local')->delete($path);
            }
        }
    }

    public function importStudents(UploadedFile $file, ?string $defaultPassword = null): array
    {
        return $this->withStoredFile(
            $file,
            fn (string $fullPath) => (new StudentsImport($defaultPassword))->import($fullPath),
        );
    }

    public function importTeachers(UploadedFile $file, ?string $defaultPassword = null): array
    {
        return $this->withStoredFile(
            $file,
            fn (string $fullPath) => (new TeachersImport($defaultPassword))->import($fullPath),
        );
    }

    public function importClasses(UploadedFile $file): array
    {
        return $this->withStoredFile(
            $file,
            fn (string $fullPath) => (new SchoolClassesImport())->import($fullPath),
        );
    }

    public function importGuardians(UploadedFile $file, ?string $defaultPassword = null): array
    {
        return $this->withStoredFile(
            $file,
            fn (string $fullPath) => (new GuardiansImport($defaultPassword))->import($fullPath),
        );
    }

    public function generateTemplateCsv(string $entity): string
    {
        $defaultPassword = config('auth.defaults.user_password', 'SmaUii@2026');

        return match ($entity) {
            'students' => "nis,nisn,name,class,birth_date,phone,address,enrollment_year,email,password\n2716,0009123456,ABIMANYU PANDITA PRABASWARA,X-1,2010-05-12,081234567890,Jl. Kaliurang KM 10,2026,abimanyu2716@smauiiyk.sch.id,{$defaultPassword}\n",
            'teachers' => "teacher_code,name,email,teacher_type,password\nTCH-001,AHMAD HANIF HASAN ROSYIDI, S.Kom,hanif@smauiiyk.sch.id,homeroom,{$defaultPassword}\n",
            'classes' => "name,level,academic_year,capacity,teacher_code\nX-1,X,2026/2027,36,TCH-001\n",
            'guardians' => "name,phone,address,email,username,password\nBambang Suherman,081298765432,Jl. Kaliurang KM 9,bambang@gmail.com,081298765432,{$defaultPassword}\n",
            default => "name\nContoh Data\n",
        };
    }
}
