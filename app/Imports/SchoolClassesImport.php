<?php

namespace App\Imports;

use App\Models\SchoolClass;
use App\Models\Teacher;
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

        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $cells = [];
                foreach ($row->getCells() as $cell) {
                    $cells[] = (string) $cell->getValue();
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
                    $this->errors[] = 'Row ' . ($reader->getSheetIterator()->key() + 1) . ': ' . $e->getMessage();
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
            $capacity = (int) ($data['capacity'] ?? $data['Kapasitas'] ?? $data['kapasitas'] ?? 36);
            $teacherCode = trim($data['teacher_code'] ?? $data['Kode Guru'] ?? $data['wali_kelas'] ?? '');

            if (empty($name)) {
                throw new \RuntimeException('Nama kelas wajib diisi.');
            }

            if (SchoolClass::where('name', $name)->exists()) {
                throw new \RuntimeException("Kelas {$name} sudah terdaftar.");
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

            SchoolClass::create([
                'name' => $name,
                'level' => in_array($level, ['X', 'XI', 'XII']) ? $level : 'X',
                'capacity' => $capacity > 0 ? $capacity : 36,
                'teacher_id' => $teacherId,
            ]);

            $this->success[] = "Kelas {$name} (Tingkat {$level})";
        });
    }
}
