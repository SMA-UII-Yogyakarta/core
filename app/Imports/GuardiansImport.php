<?php

namespace App\Imports;

use App\Models\Guardian;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OpenSpout\Reader\Common\Creator\ReaderFactory;

class GuardiansImport
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
                        if (str_contains($msg, 'users_email_unique')) {
                            $msg = 'Email wali murid sudah terdaftar untuk akun lain.';
                        } elseif (str_contains($msg, 'users_username_unique')) {
                            $msg = 'Username wali murid sudah terdaftar di sistem.';
                        } else {
                            $msg = 'Data wali murid sudah terdaftar di sistem (duplicate entry).';
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
            $name = trim($data['name'] ?? $data['Nama'] ?? $data['nama'] ?? $data['NAMA'] ?? '');
            $phone = trim($data['phone'] ?? $data['Telepon'] ?? $data['no_hp'] ?? $data['telepon'] ?? '');
            $address = trim($data['address'] ?? $data['Alamat'] ?? $data['alamat'] ?? '');
            $email = trim($data['email'] ?? $data['Email'] ?? '');
            $username = trim($data['username'] ?? $data['Username'] ?? '');

            if (empty($name)) {
                throw new \RuntimeException('Nama wali murid wajib diisi.');
            }

            if (empty($username)) {
                $username = ! empty($phone) ? 'wali_' . preg_replace('/[^0-9]/', '', $phone) : 'wali_' . fake()->unique()->numerify('#####');
            }

            $existingUser = User::where('username', $username)->first();

            // Check email uniqueness if email provided
            if (! empty($email)) {
                $emailUser = User::where('email', $email)->first();
                if ($emailUser && (! $existingUser || $emailUser->id !== $existingUser->id)) {
                    throw new \RuntimeException("Email '{$email}' sudah terdaftar untuk pengguna lain ({$emailUser->name}).");
                }
            }

            if ($existingUser && $existingUser->guardian) {
                $existingUser->update([
                    'name' => $name,
                    'email' => ! empty($email) ? $email : $existingUser->email,
                ]);
                $existingUser->guardian->update([
                    'name' => $name,
                    'phone' => ! empty($phone) ? $phone : $existingUser->guardian->phone,
                    'address' => ! empty($address) ? $address : $existingUser->guardian->address,
                ]);
                $this->success[] = "{$name} - Diperbarui";

                return;
            }

            if ($existingUser) {
                $existingUser->update([
                    'name' => $name,
                    'email' => ! empty($email) ? $email : $existingUser->email,
                ]);
                Guardian::create([
                    'user_id' => $existingUser->id,
                    'name' => $name,
                    'phone' => ! empty($phone) ? $phone : null,
                    'address' => ! empty($address) ? $address : null,
                ]);
                $this->success[] = "{$name}";

                return;
            }

            $user = User::create([
                'username' => $username,
                'name' => $name,
                'email' => ! empty($email) ? $email : null,
                'password' => Hash::make('password'),
                'role' => 'guardian',
            ]);
            $user->assignRole('guardian');

            Guardian::create([
                'user_id' => $user->id,
                'name' => $name,
                'phone' => ! empty($phone) ? $phone : null,
                'address' => ! empty($address) ? $address : null,
            ]);

            $this->success[] = "{$name}";
        });
    }
}
