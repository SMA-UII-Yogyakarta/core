<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentService
{
    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Student::query()
            ->with(['user', 'class', 'guardian'])
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->whereAny(['name', 'nis', 'nisn'], 'like', "%{$v}%"))
            ->when($filters['class_id'] ?? null, fn ($q, $v) => $q->where('class_id', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Student
    {
        return Student::with(['user', 'class', 'guardian', 'attendances', 'leaveRequests'])->find($id);
    }

    public function findByUserId(int $userId): ?Student
    {
        return Student::with(['user', 'class'])->where('user_id', $userId)->first();
    }

    public function create(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            // Create user account
            $user = User::create([
                'username' => $data['nis'],
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password'] ?? 'password'),
                'role' => 'student',
            ]);
            $user->assignRole('student');

            // Create student profile
            $student = Student::create([
                'user_id' => $user->id,
                'class_id' => $data['class_id'],
                'nis' => $data['nis'],
                'nisn' => $data['nisn'],
                'name' => $data['name'],
                'birth_date' => $data['birth_date'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'enrollment_year' => $data['enrollment_year'],
                'status' => $data['status'] ?? 'Active',
                'guardian_id' => $data['guardian_id'] ?? null,
            ]);

            return $student->load(['user', 'class', 'guardian']);
        });
    }

    public function update(int $id, array $data): Student
    {
        $student = Student::findOrFail($id);

        DB::transaction(function () use ($student, $data) {
            $student->update($data);

            if (isset($data['name'])) {
                $student->user->update(['name' => $data['name']]);
            }
        });

        return $student->fresh(['user', 'class', 'guardian']);
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $student = Student::findOrFail($id);
            $student->user->delete(); // cascades to student
        });
    }

    public function toggleStatus(int $id): Student
    {
        $student = Student::findOrFail($id);
        $student->update([
            'status' => $student->status === 'Active' ? 'Inactive' : 'Active',
        ]);
        return $student->fresh();
    }

    public function findByClass(int $classId): \Illuminate\Database\Eloquent\Collection
    {
        return Student::with(['user', 'class'])
            ->where('class_id', $classId)
            ->where('status', 'Active')
            ->get();
    }

    public function findUnassigned(): \Illuminate\Database\Eloquent\Collection
    {
        return Student::with(['user'])
            ->whereNull('class_id')
            ->where('status', 'Active')
            ->get();
    }
}
