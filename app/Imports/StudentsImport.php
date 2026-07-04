<?php

namespace App\Imports;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenSpout\Reader\Common\Creator\ReaderEntityFactory;

class StudentsImport
{
    private array $errors = [];
    private array $success = [];

    public function import(string $filePath): array
    {
        $reader = ReaderEntityFactory::createReaderFromFile($filePath);
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
                    $this->errors[] = 'Baris ' . ($reader->getSheetIterator()->key() + 1) . ': ' . $e->getMessage();
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
            $nis = $data['nis'] ?? $data['NIS'] ?? '';
            $nisn = $data['nisn'] ?? $data['NISN'] ?? '';
            $name = $data['name'] ?? $data['Nama'] ?? $data['NAMA'] ?? '';
            $className = $data['class'] ?? $data['Kelas'] ?? $data['KELAS'] ?? '';

            if (empty($nis) || empty($name)) {
                throw new \RuntimeException('NIS dan Nama wajib diisi.');
            }

            if (User::where('username', $nis)->exists()) {
                throw new \RuntimeException("Username {$nis} sudah terdaftar.");
            }

            $classId = null;
            if (! empty($className)) {
                $class = SchoolClass::where('name', $className)->first();
                if ($class) {
                    $classId = $class->id;
                }
            }

            $user = User::create([
                'username' => $nis,
                'name' => $name,
                'email' => $data['email'] ?? $data['Email'] ?? null,
                'password' => Hash::make('password'),
                'role' => 'student',
            ]);
            $user->assignRole('student');

            Student::create([
                'user_id' => $user->id,
                'class_id' => $classId,
                'nis' => $nis,
                'nisn' => $nisn,
                'name' => $name,
                'birth_date' => $data['birth_date'] ?? $data['Tanggal Lahir'] ?? null,
                'phone' => $data['phone'] ?? $data['Telepon'] ?? null,
                'address' => $data['address'] ?? $data['Alamat'] ?? null,
                'enrollment_year' => $data['enrollment_year'] ?? $data['Tahun Masuk'] ?? date('Y'),
                'status' => 'Active',
            ]);

            $this->success[] = "{$name} ({$nis})";
        });
    }
}
