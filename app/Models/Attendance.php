<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $student_id
 * @property \Illuminate\Support\Carbon $attendance_date
 * @property \Illuminate\Support\Carbon $check_in_time
 * @property string $latitude
 * @property string $longitude
 * @property string $photo_url
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Student|null $student
 * @method static \Database\Factories\AttendanceFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAttendanceDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckInTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance wherePhotoUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStudentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';

    protected $fillable = [
        'student_id',
        'attendance_date',
        'check_in_time',
        'latitude',
        'longitude',
        'photo_url',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'check_in_time' => 'datetime:H:i:s',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function getPhotoUrlAttribute(?string $value): ?string
    {
        if (empty($value)) {
            return $value;
        }

        if (str_contains($value, 'rustfs:9000') || str_contains($value, 'localhost:9000') || str_contains($value, '127.0.0.1:9000')) {
            $path = preg_replace('#^https?://[^/]+/(smauii-attendance/)?#', '', $value);
            return route('storage-s3', ['path' => $path]);
        }

        if (! str_starts_with($value, 'http://') && ! str_starts_with($value, 'https://') && ! str_starts_with($value, '/')) {
            return route('storage-s3', ['path' => $value]);
        }

        return $value;
    }
}
