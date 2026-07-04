<?php

namespace App\Services;

use App\Models\AcademicCalendar;
use Illuminate\Pagination\LengthAwarePaginator;

class AcademicCalendarService
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return AcademicCalendar::query()
            ->when($filters['year'] ?? null, fn ($q, $v) => $q->whereYear('holiday_date', $v))
            ->when($filters['month'] ?? null, fn ($q, $v) => $q->whereMonth('holiday_date', $v))
            ->when(filled($filters['is_holiday'] ?? null), fn ($q) => $q->where('is_holiday', true))
            ->latest('holiday_date')
            ->paginate($perPage);
    }

    public function findAll(): array
    {
        return AcademicCalendar::orderBy('holiday_date')->get()->toArray();
    }

    public function create(array $data): AcademicCalendar
    {
        return AcademicCalendar::create([
            'holiday_date' => $data['holiday_date'],
            'description' => $data['description'] ?? null,
            'is_holiday' => $data['is_holiday'] ?? true,
        ]);
    }

    public function update(int $id, array $data): AcademicCalendar
    {
        $cal = AcademicCalendar::findOrFail($id);
        $cal->update($data);
        return $cal->fresh();
    }

    public function delete(int $id): void
    {
        AcademicCalendar::findOrFail($id)->delete();
    }

    public function isHoliday(string $date): bool
    {
        return AcademicCalendar::whereDate('holiday_date', $date)
            ->where('is_holiday', true)
            ->exists();
    }
}
