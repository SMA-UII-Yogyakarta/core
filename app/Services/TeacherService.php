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
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('name', 'like', "%{$v}%")
                ->orWhere('teacher_code', 'like', "%{$v}%"))
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
            $user = User::create([
                'username' => $data['teacher_code'],
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password'] ?? 'password'),
                'role' => 'teacher',
            ]);
            $user->assignRole('teacher');

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'teacher_code' => $data['teacher_code'],
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
            if (array_key_exists('email', $data)) {
                $userUpdates['email'] = $data['email'];
            }
            if (! empty($data['password'])) {
                $userUpdates['password'] = Hash::make($data['password']);
            }

            if (! empty($userUpdates)) {
                $teacher->user->update($userUpdates);
            }

            return $teacher->fresh(['user', 'schoolClasses']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $teacher = Teacher::findOrFail($id);
            $teacher->user->delete();
        });
    }
}
