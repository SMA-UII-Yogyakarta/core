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
            ]);

            return $teacher->load(['user', 'schoolClasses']);
        });
    }

    public function update(int $id, array $data): Teacher
    {
        $teacher = Teacher::findOrFail($id);
        $teacher->update($data);

        if (isset($data['name'])) {
            $teacher->user->update(['name' => $data['name']]);
        }

        return $teacher->fresh(['user', 'schoolClasses']);
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $teacher = Teacher::findOrFail($id);
            $teacher->user->delete();
        });
    }
}
