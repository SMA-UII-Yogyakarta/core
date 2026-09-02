<?php

namespace App\Imports;

use App\Models\SchoolClass;
use App\Models\Teacher;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use OpenSpout\Reader\Common\Creator\ReaderFactory;

class SchoolClassesImport
{
    private array $errors = [];

    private array $success = [];

    public function import(string $filePath): array
    {
        $reader = ReaderFactory::createFromFile($filePath);
        $reader->open($filePath);

        $isFirstRow = true;
        $headers = [];
        $currentRowIndex = 0;

        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $currentRowIndex++;

                $cells = [];
                foreach ($row->getCells() as $cell) {
                    $cells[] = trim((string) $cell->getValue());
                }

                if ($isFirstRow) {
                    $headers = $cells;
                    $isFirstRow = false;

                    continue;
                }

                if (empty(array_filter($cells))) {
                    continue;
                }

                $data = array_combine($headers, $cells);

                try {
                    $this->importRow($data);
                } catch (\Exception $e) {
                    $msg = $e->getMessage();
                    if ($e instanceof QueryException && str_contains($msg, '23505')) {
                        $msg = 'Nama kelas dan tahun ajaran sudah terdaftar di sistem.';
                    }
                    $this->errors[] = "Baris {$currentRowIndex}: {$msg}";
                }
            }
        }

        $reader->close();

        return [
            'success_count' => count($this->success),
            'error_count' => count($this->errors),
            'errors' => $this->errors,
            'success' => $this->success,
        ];
    }

    private function importRow(array $data): void
    {
        DB::transaction(function () use ($data) {
            $name = trim($data['name'] ?? $data['Nama Kelas'] ?? $data['nama_kelas'] ?? $data['Nama'] ?? '');
            $level = trim($data['level'] ?? $data['Tingkat'] ?? $data['tingkat'] ?? 'X');
            $academicYear = trim($data['academic_year'] ?? $data['Tahun Ajaran'] ?? $data['tahun_ajaran'] ?? $data['Angkatan'] ?? $data['angkatan'] ?? '2024/2025');
            $capacity = (int) ($data['capacity'] ?? $data['Kapasitas'] ?? $data['kapasitas'] ?? 36);
            $teacherCode = trim($data['teacher_code'] ?? $data['Kode Guru'] ?? $data['wali_kelas'] ?? '');

            if (empty($name)) {
                throw new \RuntimeException('Nama kelas wajib diisi.');
            }

            $teacherId = null;
            if (! empty($teacherCode)) {
                $teacher = Teacher::where('teacher_code', $teacherCode)
                    ->orWhere('name', $teacherCode)
                    ->first();
                if ($teacher) {
                    $teacherId = $teacher->id;
                }
            }

            $existingClass = SchoolClass::where('name', $name)
                ->where('academic_year', $academicYear)
                ->first();

            if ($existingClass) {
                $existingClass->update([
                    'level' => in_array($level, ['X', 'XI', 'XII']) ? $level : $existingClass->level,
                    'academic_year' => ! empty($academicYear) ? $academicYear : $existingClass->academic_year,
                    'capacity' => $capacity > 0 ? $capacity : $existingClass->capacity,
                    'teacher_id' => $teacherId ?? $existingClass->teacher_id,
                ]);
                $this->success[] = "Kelas {$name} ({$academicYear}) - Diperbarui";

                return;
            }

            SchoolClass::create([
                'name' => $name,
                'level' => in_array($level, ['X', 'XI', 'XII']) ? $level : 'X',
                'academic_year' => ! empty($academicYear) ? $academicYear : '2024/2025',
                'capacity' => $capacity > 0 ? $capacity : 36,
                'teacher_id' => $teacherId,
            ]);

            $this->success[] = "Kelas {$name} (Tingkat {$level}, {$academicYear})";
        });
    }
}
