<?php

namespace App\Services;

use App\Models\Guardian;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GuardianService
{
    /** @return Collection<int, Guardian> */
    public function findAll(): Collection
    {
        return Guardian::select(['id', 'name'])->get();
    }

    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Guardian::query()
            ->with(['user', 'students'])
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->when($filters['has_student'] ?? null, function ($q, $v) {
                if ($v === 'linked') {
                    $q->has('students');
                } elseif ($v === 'unlinked') {
                    $q->doesntHave('students');
                }
            })
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Guardian
    {
        return Guardian::with(['user', 'students'])->find($id);
    }

    public function findByUserId(int $userId): ?Guardian
    {
        return Guardian::with(['user', 'students.class'])->where('user_id', $userId)->first();
    }

    public function create(array $data): Guardian
    {
        return DB::transaction(function () use ($data) {
            $name = trim((string) $data['name']);
            $phone = ! empty($data['phone']) ? (string) preg_replace('/[^0-9]/', '', (string) $data['phone']) : null;
            $baseUsername = $phone ?: 'wali-' . strtolower((string) preg_replace('/[^a-z0-9]/', '', $name));
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $counter++;
                $username = "{$baseUsername}-{$counter}";
            }

            $user = User::create([
                'username' => $username,
                'name' => $name,
                'email' => ! empty($data['email']) ? trim((string) $data['email']) : null,
                'password' => Hash::make(! empty($data['password']) ? $data['password'] : config('auth.defaults.user_password', 'SmaUii@2026')),
                'role' => 'guardian',
            ]);

            $guardian = Guardian::create([
                'user_id' => $user->id,
                'name' => $name,
                'phone' => ! empty($data['phone']) ? trim((string) $data['phone']) : null,
                'address' => ! empty($data['address']) ? trim((string) $data['address']) : null,
            ]);

            return $guardian->load(['user', 'students']);
        });
    }

    public function update(int $id, array $data): Guardian
    {
        $guardian = Guardian::findOrFail($id);

        DB::transaction(function () use ($guardian, $data) {
            $guardian->update(Arr::only($data, ['name', 'phone', 'address']));

            $userUpdates = [];
            if (isset($data['name'])) {
                $userUpdates['name'] = trim((string) $data['name']);
            }
            if (array_key_exists('email', $data) && ! empty($data['email'])) {
                $userUpdates['email'] = trim((string) $data['email']);
            }
            if (! empty($data['password'])) {
                $userUpdates['password'] = Hash::make($data['password']);
            }
            if (! empty($data['phone'])) {
                $cleanPhone = (string) preg_replace('/[^0-9]/', '', (string) $data['phone']);
                if ($cleanPhone !== '') {
                    $userUpdates['username'] = $cleanPhone;
                }
            }

            if (! empty($userUpdates)) {
                $guardian->user->update($userUpdates);
            }
        });

        return $guardian->fresh(['user', 'students']);
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $guardian = Guardian::findOrFail($id);
            $guardian->user->delete();
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        $deleted = 0;

        DB::transaction(function () use ($ids, &$deleted) {
            foreach (array_unique($ids) as $id) {
                $guardian = Guardian::with('user')->find($id);
                if (! $guardian) {
                    continue;
                }
                $guardian->user->delete();
                $deleted++;
            }
        });

        return $deleted;
    }

    public function linkToStudent(int $guardianId, int $studentId): void
    {
        Guardian::findOrFail($guardianId);
        Student::where('id', $studentId)->update(['guardian_id' => $guardianId]);
    }
}
