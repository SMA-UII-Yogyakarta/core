<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $now = now();
        $tab = $this->query('tab', 'daily');
        $tab = in_array($tab, ['daily', 'monthly', 'semester'], true) ? $tab : 'daily';

        $date = $this->query('date', $now->toDateString());
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $date) || ! strtotime($date)) {
            $date = $now->toDateString();
        }

        $month = (int) $this->query('month', $now->month);
        if ($month < 1 || $month > 12) {
            $month = $now->month;
        }

        $isSemester = $tab === 'semester';
        $defaultAcademicYear = $now->month <= 6 ? $now->year - 1 : $now->year;
        $defaultYear = $isSemester ? $defaultAcademicYear : $now->year;

        $year = (int) $this->query('year', $defaultYear);
        if ($year < 2020) {
            $year = $defaultYear;
        }

        $defaultSemester = $now->month <= 6 ? '2' : '1';
        $semester = $this->query('semester', $defaultSemester);
        if (! in_array($semester, ['1', '2'], true)) {
            $semester = $defaultSemester;
        }

        $this->merge([
            'tab' => $tab,
            'date' => $date,
            'month' => $month,
            'year' => $year,
            'semester' => $semester,
        ]);
    }

    public function rules(): array
    {
        $tab = $this->input('tab', 'daily');

        $rules = [
            'tab' => ['sometimes', 'in:daily,monthly,semester'],
        ];

        if ($tab === 'semester') {
            $rules['semester'] = ['required', 'in:1,2'];
            $rules['year'] = ['required', 'integer', 'min:2020'];
        } elseif ($tab === 'monthly') {
            $rules['month'] = ['required', 'integer', 'between:1,12'];
            $rules['year'] = ['required', 'integer', 'min:2020'];
        } else {
            $rules['date'] = ['required', 'date_format:Y-m-d'];
        }

        return $rules;
    }
}
