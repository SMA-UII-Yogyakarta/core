<?php

namespace App\Imports;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenSpout\Reader\Common\Creator\ReaderFactory;

class TeachersImport
{
    private array $errors = [];

    private array $success = [];

    public function __construct(
        protected ?string $defaultPassword = null,
    ) {
    }

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
                        if (str_contains($msg, 'teachers_teacher_code_unique')) {
                            $msg = 'Kode guru sudah terdaftar di sistem.';
                        } elseif (str_contains($msg, 'users_email_unique')) {
                            $msg = 'Email guru sudah terdaftar untuk akun lain.';
                        } elseif (str_contains($msg, 'users_username_unique')) {
                            $msg = 'Username guru sudah terdaftar di sistem.';
                        } else {
                            $msg = 'Data guru sudah terdaftar di sistem (duplicate entry).';
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
            $code = trim($data['teacher_code'] ?? $data['Kode'] ?? $data['kode'] ?? $data['nip'] ?? $data['NIP'] ?? '');
            $name = trim($data['name'] ?? $data['Nama'] ?? $data['NAMA'] ?? '');
            $email = trim($data['email'] ?? $data['Email'] ?? $data['EMAIL'] ?? '');
            $password = trim($data['password'] ?? $data['Password'] ?? $data['Kata Sandi'] ?? $data['kata_sandi'] ?? '');

            $typeRaw = strtolower(trim($data['teacher_type'] ?? $data['type'] ?? $data['Type'] ?? $data['Tipe'] ?? $data['tipe'] ?? $data['tipe_guru'] ?? $data['Tipe Guru'] ?? 'piket'));
            $typeMap = [
                'wali' => ['homeroom'],
                'wali kelas' => ['homeroom'],
                'homeroom' => ['homeroom'],
                'piket' => ['duty'],
                'guru piket' => ['duty'],
                'duty' => ['duty'],
                'both' => ['duty', 'homeroom'],
                'keduanya' => ['duty', 'homeroom'],
                'wali,piket' => ['duty', 'homeroom'],
                'piket,wali' => ['duty', 'homeroom'],
                'wali kelas,guru piket' => ['duty', 'homeroom'],
                'guru piket,wali kelas' => ['duty', 'homeroom'],
            ];
            $type = $typeMap[$typeRaw] ?? (
                (str_contains($typeRaw, 'wali') && str_contains($typeRaw, 'piket')) || (str_contains($typeRaw, 'duty') && str_contains($typeRaw, 'homeroom'))
                    ? ['duty', 'homeroom']
                    : (str_contains($typeRaw, 'wali') || str_contains($typeRaw, 'homeroom') ? ['homeroom'] : ['duty'])
            );

            if (empty($name)) {
                throw new \RuntimeException('Nama guru wajib diisi.');
            }

            // Auto-generate teacher_code if empty
            if (empty($code)) {
                $maxId = (int) Teacher::max('id') + 1;
                do {
                    $code = sprintf('TCH-%03d', $maxId++);
                } while (Teacher::where('teacher_code', $code)->exists() || User::where('username', $code)->exists());
            }

            // Check existing teacher & user by teacher_code/username
            $existingTeacher = Teacher::where('teacher_code', $code)->first();
            $existingUser = User::where('username', $code)->first();

            // Check email uniqueness if email provided
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

            if ($existingTeacher) {
                // Update existing teacher & user (Upsert)
                $user = $existingTeacher->user;
                $userUpdateData = [
                    'name' => $name,
                    'email' => ! empty($email) ? $email : $user->email,
                ];
                if (! empty($password)) {
                    $userUpdateData['password'] = Hash::make($password);
                }
                $user->update($userUpdateData);

                $existingTeacher->update([
                    'name' => $name,
                    'teacher_type' => $type,
                ]);
                $this->success[] = "{$name} ({$code}) - Diperbarui";

                return;
            }

            if ($existingUser) {
                // User exists without teacher record
                $userUpdateData = [
                    'name' => $name,
                    'email' => ! empty($email) ? $email : $existingUser->email,
                ];
                if (! empty($password)) {
                    $userUpdateData['password'] = Hash::make($password);
                }
                $existingUser->update($userUpdateData);

                Teacher::create([
                    'user_id' => $existingUser->id,
                    'teacher_code' => $code,
                    'name' => $name,
                    'teacher_type' => $type,
                ]);
                $this->success[] = "{$name} ({$code})";

                return;
            }

            $initialPassword = ! empty($password)
                ? $password
                : (! empty($this->defaultPassword) ? $this->defaultPassword : 'SmaUii@' . date('Y'));

            // Create new User and Teacher
            $user = User::create([
                'username' => $code,
                'name' => $name,
                'email' => ! empty($email) ? $email : null,
                'password' => Hash::make($initialPassword),
                'role' => 'teacher',
            ]);
            $user->assignRole('teacher');

            Teacher::create([
                'user_id' => $user->id,
                'teacher_code' => $code,
                'name' => $name,
                'teacher_type' => $type,
            ]);

            $this->success[] = "{$name} ({$code})";
        });
    }
}
