<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherService
{
    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Teacher::query()
            ->with(['user', 'schoolClasses'])
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->whereAny(['name', 'teacher_code'], 'like', "%{$v}%"))
            ->when($filters['teacher_type'] ?? null, fn ($q, $v) => $q->whereJsonContains('teacher_type', $v))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Teacher
    {
        return Teacher::with(['user', 'schoolClasses', 'dutySchedules'])->find($id);
    }

    public function findByUserId(int $userId): ?Teacher
    {
        return Teacher::with(['user', 'schoolClasses'])->where('user_id', $userId)->first();
    }

    public function create(array $data): Teacher
    {
        return DB::transaction(function () use ($data) {
            $code = trim((string) $data['teacher_code']);
            $name = trim((string) $data['name']);
            $email = ! empty($data['email']) ? trim((string) $data['email']) : null;

            if (! $email) {
                $parts = explode(' ', $name);
                $cleanFirst = (string) preg_replace('/[^a-z0-9]/', '', strtolower($parts[0]));
                $cleanFirst = $cleanFirst !== '' ? $cleanFirst : 'guru';
                $cleanCode = (string) preg_replace('/[^a-z0-9]/', '', strtolower($code));
                $candidate = "{$cleanFirst}.{$cleanCode}@smauiiyk.sch.id";
                $counter = 1;
                while (User::where('email', $candidate)->exists()) {
                    $counter++;
                    $candidate = "{$cleanFirst}.{$cleanCode}.{$counter}@smauiiyk.sch.id";
                }
                $email = $candidate;
            }

            $user = User::create([
                'username' => $code,
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(! empty($data['password']) ? $data['password'] : config('auth.defaults.user_password', 'SmaUii@2026')),
                'role' => 'teacher',
            ]);
            $user->assignRole('teacher');

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'name' => $name,
                'teacher_code' => $code,
                'teacher_type' => $data['teacher_type'] ?? ['duty'],
            ]);

            return $teacher->load(['user', 'schoolClasses']);
        });
    }

    public function update(int $id, array $data): Teacher
    {
        return DB::transaction(function () use ($id, $data) {
            $teacher = Teacher::findOrFail($id);
            $teacher->update($data);

            $userUpdates = [];
            if (isset($data['name'])) {
                $userUpdates['name'] = $data['name'];
            }
            if (isset($data['teacher_code'])) {
                $userUpdates['username'] = trim((string) $data['teacher_code']);
            }
            if (array_key_exists('email', $data) && ! empty($data['email'])) {
                $userUpdates['email'] = $data['email'];
            }
            if (! empty($data['password'])) {
                $userUpdates['password'] = Hash::make($data['password']);
            }

            if (! empty($userUpdates) && $teacher->user) {
                $teacher->user->update($userUpdates);
            }

            return $teacher->fresh(['user', 'schoolClasses']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $teacher = Teacher::findOrFail($id);
            if ($teacher->user) {
                $teacher->user->delete();
            } else {
                $teacher->delete();
            }
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
                $teacher = Teacher::with('user')->find($id);
                if (! $teacher) {
                    continue;
                }
                if ($teacher->user) {
                    $teacher->user->delete();
                } else {
                    $teacher->delete();
                }
                $deleted++;
            }
        });

        return $deleted;
    }
}
