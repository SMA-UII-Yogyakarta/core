<?php

namespace App\Services;

use Carbon\Carbon;

class SemesterHelper
{
    /**
     * Resolves the start and end dates for a given academic year and semester.
     *
     * @param int $academicYear The start year of the academic year (e.g. 2025 for TA 2025/2026)
     * @param int|string $semester 1 for Ganjil (Jul-Dec), 2 for Genap (Jan-Jun)
     * @return array{start: Carbon, end: Carbon, months: array<int, array{month: int, year: int}>}
     */
    public static function resolveDates(int $academicYear, int|string $semester): array
    {
        $semester = (int) $semester;

        if ($semester === 1) {
            // Semester 1 (Ganjil): July to December of $academicYear
            $start = Carbon::create($academicYear, 7, 1)->startOfDay();
            $end = Carbon::create($academicYear, 12, 31)->endOfDay();
            $months = [];
            for ($m = 7; $m <= 12; $m++) {
                $months[] = ['month' => $m, 'year' => $academicYear];
            }
        } else {
            // Semester 2 (Genap): January to June of $academicYear + 1
            $start = Carbon::create($academicYear + 1, 1, 1)->startOfDay();
            $end = Carbon::create($academicYear + 1, 6, 30)->endOfDay();
            $months = [];
            for ($m = 1; $m <= 6; $m++) {
                $months[] = ['month' => $m, 'year' => $academicYear + 1];
            }
        }

        return ['start' => $start, 'end' => $end, 'months' => $months];
    }
}
