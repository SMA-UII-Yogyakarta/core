<?php

namespace App\Imports;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenSpout\Reader\Common\Creator\ReaderFactory;

class StudentsImport
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
                        if (str_contains($msg, 'students_nis_unique')) {
                            $msg = 'NIS siswa sudah terdaftar di sistem.';
                        } elseif (str_contains($msg, 'students_nisn_unique')) {
                            $msg = 'NISN siswa sudah terdaftar di sistem.';
                        } elseif (str_contains($msg, 'users_email_unique')) {
                            $msg = 'Email siswa sudah terdaftar untuk akun lain.';
                        } elseif (str_contains($msg, 'users_username_unique')) {
                            $msg = 'Username (NIS) siswa sudah terdaftar di sistem.';
                        } else {
                            $msg = 'Data siswa sudah terdaftar di sistem (duplicate entry).';
                        }
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
            $nis = trim($data['nis'] ?? $data['NIS'] ?? '');
            $nisn = trim($data['nisn'] ?? $data['NISN'] ?? '');
            $name = trim($data['name'] ?? $data['Nama'] ?? $data['NAMA'] ?? '');
            $className = trim($data['class'] ?? $data['Kelas'] ?? $data['KELAS'] ?? '');
            $birthDate = trim($data['birth_date'] ?? $data['Tanggal Lahir'] ?? '');
            $email = trim($data['email'] ?? $data['Email'] ?? '');
            $enrollmentYear = trim($data['enrollment_year'] ?? $data['Tahun Masuk'] ?? '');

            if (empty($nis) || empty($name)) {
                throw new \RuntimeException('NIS dan nama siswa wajib diisi.');
            }

            if (empty($birthDate)) {
                throw new \RuntimeException("Tanggal lahir wajib diisi untuk siswa {$name}.");
            }

            if ($enrollmentYear !== '' && ! preg_match('/^\d{4}$/', $enrollmentYear)) {
                throw new \RuntimeException("Tahun masuk tidak valid untuk siswa {$name}.");
            }

            $enrollmentYear = $enrollmentYear !== '' ? $enrollmentYear : date('Y');

            $classId = null;
            if (! empty($className)) {
                $class = SchoolClass::where('name', $className)->first();
                if ($class) {
                    $classId = $class->id;
                }
            }

            $existingStudent = Student::where('nis', $nis)->first();
            $existingUser = User::where('username', $nis)->first();

            // Check email uniqueness
            if (! empty($email)) {
                $emailUser = User::where('email', $email)->first();
                if ($emailUser) {
                    if ($existingUser === null) {
                        throw new \RuntimeException("Email '{$email}' sudah terdaftar untuk pengguna lain ({$emailUser->name}).");
                    }
                    if ($emailUser->id !== $existingUser->id) {
                        throw new \RuntimeException("Email '{$email}' sudah terdaftar untuk pengguna lain ({$emailUser->name}).");
                    }
                }
            }

            if ($existingStudent) {
                $user = $existingStudent->user;
                $user->update([
                    'name' => $name,
                    'email' => ! empty($email) ? $email : $user->email,
                ]);
                $existingStudent->update([
                    'name' => $name,
                    'nisn' => ! empty($nisn) ? $nisn : $existingStudent->nisn,
                    'class_id' => $classId ?? $existingStudent->class_id,
                    'birth_date' => $birthDate,
                    'phone' => trim($data['phone'] ?? $data['Telepon'] ?? $existingStudent->phone),
                    'address' => trim($data['address'] ?? $data['Alamat'] ?? $existingStudent->address),
                    'enrollment_year' => $enrollmentYear,
                ]);
                $this->success[] = "{$name} ({$nis}) - Diperbarui";

                return;
            }

            if ($existingUser) {
                $existingUser->update([
                    'name' => $name,
                    'email' => ! empty($email) ? $email : $existingUser->email,
                ]);
                Student::create([
                    'user_id' => $existingUser->id,
                    'class_id' => $classId,
                    'nis' => $nis,
                    'nisn' => $nisn,
                    'name' => $name,
                    'birth_date' => $birthDate,
                    'phone' => trim($data['phone'] ?? $data['Telepon'] ?? null),
                    'address' => trim($data['address'] ?? $data['Alamat'] ?? null),
                    'enrollment_year' => $enrollmentYear,
                    'status' => 'Active',
                ]);
                $this->success[] = "{$name} ({$nis})";

                return;
            }

            $user = User::create([
                'username' => $nis,
                'name' => $name,
                'email' => ! empty($email) ? $email : null,
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
                'birth_date' => $birthDate,
                'phone' => trim($data['phone'] ?? $data['Telepon'] ?? null),
                'address' => trim($data['address'] ?? $data['Alamat'] ?? null),
                'enrollment_year' => $enrollmentYear,
                'status' => 'Active',
            ]);

            $this->success[] = "{$name} ({$nis})";
        });
    }
}
