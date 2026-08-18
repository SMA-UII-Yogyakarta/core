<?php

namespace App\Imports;

use App\Models\Guardian;
use App\Models\User;
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

            if (User::where('username', $username)->exists()) {
                $username = $username . '_' . rand(10, 99);
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
