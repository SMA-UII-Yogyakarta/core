<?php

namespace App\Services;

use App\Models\AcademicCalendar;
use App\Models\AttendanceTimeSetting;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

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

    public function isActiveDay(string $date): bool
    {
        $setting = AttendanceTimeSetting::where('day', Carbon::parse($date)->format('l'))->first();

        return $setting !== null && $setting->is_active === true;
    }

    public function isSchoolDay(string $date): bool
    {
        return $this->isActiveDay($date) && ! $this->isHoliday($date);
    }

    /**
     * Summarize a collection of APPROVED leave requests into per-student
     * counts of permit and sick days, de-duplicated so that a student is
     * credited at most once per school day.
     *
     * When a student has overlapping/multiple approved leaves on the same
     * day, Sickness takes precedence over a generic permit so the same day
     * is never counted in both buckets.
     *
     * @param  \Illuminate\Support\Collection<int, \App\Models\LeaveRequest>  $leaves
     * @return array{permit: array<int, int>, sick: array<int, int>}
     */
    public function summarizeApprovedLeaveDays(Collection $leaves, Carbon $start, Carbon $end): array
    {
        $sicks = [];
        $permits = [];

        foreach ($leaves->groupBy('student_id') as $studentId => $studentLeaves) {
            $best = [];

            foreach ($studentLeaves as $leave) {
                $overlapStart = $leave->start_date->startOfDay()->greaterThan($start)
                    ? $leave->start_date->startOfDay()
                    : $start->copy();
                $overlapEnd = $leave->end_date->startOfDay()->lessThan($end)
                    ? $leave->end_date->startOfDay()
                    : $end->copy();

                if ($overlapEnd->lessThan($overlapStart)) {
                    continue;
                }

                $isSick = $leave->category === 'Sick';

                for ($d = $overlapStart->copy(); $d->lte($overlapEnd); $d->addDay()) {
                    $date = $d->toDateString();

                    if (! $this->isSchoolDay($date)) {
                        continue;
                    }

                    $existing = $best[$date] ?? null;
                    if ($existing === null || ($isSick && $existing === 'permit')) {
                        $best[$date] = $isSick ? 'sick' : 'permit';
                    }
                }
            }

            foreach ($best as $type) {
                if ($type === 'sick') {
                    $sicks[$studentId] = ($sicks[$studentId] ?? 0) + 1;
                } else {
                    $permits[$studentId] = ($permits[$studentId] ?? 0) + 1;
                }
            }
        }

        return [
            'permit' => $permits,
            'sick' => $sicks,
        ];
    }

    /**
     * Human-readable reason explaining why a date is not a school day,
     * or null when it is a school day.
     */
    public function nonSchoolDayNote(string $date): ?string
    {
        $carbon = Carbon::parse($date);

        if ($carbon->isWeekend()) {
            return 'akhir pekan';
        }

        if ($this->isHoliday($date)) {
            $calendar = AcademicCalendar::whereDate('holiday_date', $date)
                ->where('is_holiday', true)
                ->first();

            return $calendar && filled($calendar->description)
                ? 'libur: ' . $calendar->description
                : 'libur';
        }

        if (! $this->isActiveDay($date)) {
            return 'hari non-aktif';
        }

        return null;
    }

    /**
     * Whether a given date may still accrue "absent" (absent without leave).
     *
     * - Dates before today: always applicable (the day has fully elapsed).
     * - Today: applicable only once the attendance window has closed
     *   (now() >= check_in_close of today).
     * - Future dates: never applicable.
     */
    public function isAlpaApplicable(string $date): bool
    {
        $date = Carbon::parse($date)->startOfDay();
        $today = now()->startOfDay();

        if ($date->greaterThan($today)) {
            return false;
        }

        if ($date->lessThan($today)) {
            return true;
        }

        $setting = AttendanceTimeSetting::where('day', $date->format('l'))->first();

        if (! $setting) {
            return false;
        }

        return now()->greaterThanOrEqualTo($setting->check_in_close);
    }
}
