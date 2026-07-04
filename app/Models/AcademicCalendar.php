<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property \Illuminate\Support\Carbon $holiday_date
 * @property string|null $description
 * @property bool $is_holiday
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Database\Factories\AcademicCalendarFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar whereHolidayDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar whereIsHoliday($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AcademicCalendar whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class AcademicCalendar extends Model
{
    use HasFactory;

    protected $table = 'academic_calendars';

    protected $fillable = ['holiday_date', 'description', 'is_holiday'];

    protected function casts(): array
    {
        return [
            'holiday_date' => 'date',
            'is_holiday' => 'boolean',
        ];
    }
}
