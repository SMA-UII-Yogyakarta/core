<?php

namespace App\Services;

use App\Models\DutySchedule;
use Illuminate\Database\Eloquent\Collection;

class DutyScheduleService
{
    public function findAll(): Collection
    {
        return DutySchedule::with('teacher')->get();
    }

    public function findByTeacher(int $teacherId): Collection
    {
        return DutySchedule::with('teacher')
            ->where('teacher_id', $teacherId)
            ->get();
    }

    public function create(array $data): DutySchedule
    {
        return DutySchedule::create($data)->load('teacher');
    }

    public function update(int $id, array $data): DutySchedule
    {
        $schedule = DutySchedule::findOrFail($id);
        $schedule->update($data);
        return $schedule->fresh('teacher');
    }

    public function delete(int $id): void
    {
        DutySchedule::findOrFail($id)->delete();
    }
}
