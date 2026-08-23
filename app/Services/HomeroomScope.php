<?php

namespace App\Services;

use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Support\Collection;

class HomeroomScope
{
    public function __construct(
        protected TeacherService $teacherService,
    ) {
    }

    /**
     * Class ids the user may read. Null means school-wide scope.
     *
     * @return array<int, int>|null
     */
    public function classIds(User $user): ?array
    {
        if ($user->role === 'admin') {
            return null;
        }

        if ($user->role !== 'teacher') {
            return [];
        }

        $teacher = $this->teacherService->findByUserId((int) $user->id);

        if ($teacher === null) {
            return [];
        }

        if (! $teacher->isWaliKelas()) {
            return null;
        }

        /** @var array<int, int> */
        return $teacher->schoolClasses()->pluck('school_classes.id')->all();
    }

    /**
     * @return Collection<int, SchoolClass>
     */
    public function classesFor(User $user): Collection
    {
        $ids = $this->classIds($user);

        return SchoolClass::query()
            ->select('id', 'name')
            ->when($ids !== null, fn ($q) => $q->whereIn('id', $ids))
            ->orderBy('name')
            ->get();
    }

    public function assertClassAllowed(User $user, ?int $classId): void
    {
        if ($classId === null) {
            return;
        }

        $ids = $this->classIds($user);

        if ($ids === null || in_array($classId, $ids, true)) {
            return;
        }

        abort(403, 'Anda tidak memiliki akses ke kelas ini.');
    }
}
