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
            $nis = trim((string) $data['nis']);
            $name = trim((string) $data['name']);
            $email = ! empty($data['email']) ? trim((string) $data['email']) : null;

            if (! $email && ! empty($nis)) {
                $parts = explode(' ', $name);
                $cleanFirst = (string) preg_replace('/[^a-z0-9]/', '', strtolower($parts[0]));
                $cleanFirst = $cleanFirst !== '' ? $cleanFirst : 'siswa';
                $email = "{$cleanFirst}{$nis}@smauiiyk.sch.id";
            }

            // Create user account
            $user = User::create([
                'username' => $nis,
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(! empty($data['password']) ? $data['password'] : 'SmaUii@2026'),
                'role' => 'student',
            ]);
            $user->assignRole('student');

            $enrollmentYear = (int) ($data['enrollment_year'] ?? date('Y'));
            $birthDate = ! empty($data['birth_date'])
                ? $data['birth_date']
                : ($enrollmentYear - 15) . '-01-01';

            // Create student profile
            $student = Student::create([
                'user_id' => $user->id,
                'class_id' => $data['class_id'] ?? null,
                'nis' => $nis,
                'nisn' => trim((string) $data['nisn']),
                'name' => $name,
                'birth_date' => $birthDate,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'enrollment_year' => $enrollmentYear,
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

            if (! empty($userUpdates)) {
                $student->user->update($userUpdates);
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

    /**
     * @param  list<int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        $deleted = 0;

        DB::transaction(function () use ($ids, &$deleted) {
            foreach (array_unique($ids) as $id) {
                $student = Student::with('user')->find($id);
                if (! $student) {
                    continue;
                }
                // Cascades student row via user relation (same as delete()).
                $student->user->delete();
                $deleted++;
            }
        });

        return $deleted;
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

    public function assignToClass(int $studentId, ?int $classId): void
    {
        $student = Student::findOrFail($studentId);
        $student->update(['class_id' => $classId]);
    }

    /**
     * @param  list<int>  $studentIds
     */
    public function bulkAssignToClass(array $studentIds, ?int $classId): int
    {
        return Student::whereIn('id', array_unique($studentIds))->update(['class_id' => $classId]);
    }
}
