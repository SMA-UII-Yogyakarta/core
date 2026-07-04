<?php

namespace App\Services;

use App\Models\Guardian;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GuardianService
{
    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Guardian::query()
            ->with(['user', 'students'])
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Guardian
    {
        return Guardian::with(['user', 'students'])->find($id);
    }

    public function create(array $data): Guardian
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'username' => $data['phone'] ?? 'wali-' . strtolower(str_replace(' ', '', $data['name'])),
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password'] ?? 'password'),
                'role' => 'guardian',
            ]);
            $user->assignRole('guardian');

            $guardian = Guardian::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            return $guardian->load(['user', 'students']);
        });
    }

    public function update(int $id, array $data): Guardian
    {
        $guardian = Guardian::findOrFail($id);
        $guardian->update($data);

        if (isset($data['name'])) {
            $guardian->user->update(['name' => $data['name']]);
        }

        return $guardian->fresh(['user', 'students']);
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $guardian = Guardian::findOrFail($id);
            $guardian->user->delete();
        });
    }

    public function linkToStudent(int $guardianId, int $studentId): void
    {
        $guardian = Guardian::findOrFail($guardianId);
        $guardian->students()->syncWithoutDetaching([$studentId]);
    }
}
