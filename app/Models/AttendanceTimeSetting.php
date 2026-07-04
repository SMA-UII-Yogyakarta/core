<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $day
 * @property \Illuminate\Support\Carbon $check_in_open
 * @property \Illuminate\Support\Carbon $late_threshold
 * @property \Illuminate\Support\Carbon $check_in_close
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Database\Factories\AttendanceTimeSettingFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting whereCheckInClose($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting whereCheckInOpen($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting whereDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting whereLateThreshold($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceTimeSetting whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class AttendanceTimeSetting extends Model
{
    use HasFactory;

    protected $table = 'attendance_time_settings';

    protected $fillable = ['day', 'check_in_open', 'late_threshold', 'check_in_close'];

    protected function casts(): array
    {
        return [
            'check_in_open' => 'datetime:H:i:s',
            'late_threshold' => 'datetime:H:i:s',
            'check_in_close' => 'datetime:H:i:s',
        ];
    }
}
