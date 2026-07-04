<?php

namespace App\Services;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SchoolClassService
{
    public function paginate(
        array $filters = [],
        int $perPage = 10,
    ): LengthAwarePaginator {
        return SchoolClass::query()
            ->with(['teacher'])
            ->withCount('students')
            ->when(
                $filters['search'] ?? null,
                fn ($q, $v) => $q->where('name', 'like', "%{$v}%"),
            )
            ->latest()
            ->paginate($perPage);
    }

    public function findAll(): Collection
    {
        return SchoolClass::with('teacher')->get();
    }

    public function findById(int $id): ?SchoolClass
    {
        return SchoolClass::with(['teacher', 'students'])
            ->withCount('students')
            ->find($id);
    }

    public function create(array $data): SchoolClass
    {
        return SchoolClass::create($data)->load(['teacher']);
    }

    public function update(int $id, array $data): SchoolClass
    {
        $class = SchoolClass::findOrFail($id);
        $class->update($data);
        return $class->fresh(['teacher']);
    }

    public function delete(int $id): void
    {
        SchoolClass::findOrFail($id)->delete();
    }
}
