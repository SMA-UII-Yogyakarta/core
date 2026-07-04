<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $teacher_id
 * @property string $duty_day
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Teacher $teacher
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DutySchedule newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DutySchedule newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DutySchedule query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DutySchedule whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DutySchedule whereDutyDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DutySchedule whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DutySchedule whereTeacherId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DutySchedule whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class DutySchedule extends Model
{
    protected $table = 'duty_schedules';

    protected $fillable = ['teacher_id', 'duty_day'];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}
