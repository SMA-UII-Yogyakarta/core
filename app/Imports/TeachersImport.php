<?php

namespace App\Imports;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenSpout\Reader\Common\Creator\ReaderEntityFactory;

class TeachersImport
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
            $code = $data['teacher_code'] ?? $data['Kode'] ?? $data['kode'] ?? '';
            $name = $data['name'] ?? $data['Nama'] ?? $data['NAMA'] ?? '';

            if (empty($code) || empty($name)) {
                throw new \RuntimeException('Kode Guru dan Nama wajib diisi.');
            }

            if (User::where('username', $code)->exists()) {
                throw new \RuntimeException("Username {$code} sudah terdaftar.");
            }

            $user = User::create([
                'username' => $code,
                'name' => $name,
                'email' => $data['email'] ?? $data['Email'] ?? null,
                'password' => Hash::make('password'),
                'role' => 'teacher',
            ]);
            $user->assignRole('teacher');

            Teacher::create([
                'user_id' => $user->id,
                'teacher_code' => $code,
                'name' => $name,
            ]);

            $this->success[] = "{$name} ({$code})";
        });
    }
}
