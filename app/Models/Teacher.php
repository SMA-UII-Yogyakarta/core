<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $teacher_code
 * @property string $teacher_type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DutySchedule> $dutySchedules
 * @property-read int|null $duty_schedules_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SchoolClass> $schoolClasses
 * @property-read int|null $school_classes_count
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\TeacherFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereTeacherCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereTeacherType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Teacher whereUserId($value)
 * @mixin \Eloquent
 */
class Teacher extends Model
{
    use HasFactory;

    protected $table = 'teachers';

    protected $fillable = ['user_id', 'name', 'teacher_code', 'teacher_type'];

    protected $casts = [
        'teacher_type' => \Illuminate\Database\Eloquent\Casts\AsEnumCollection::class . ':' . \App\Enums\TeacherType::class,
    ];

    public function setTeacherTypeAttribute($value): void
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                $value = $decoded;
            } elseif ($value === 'both') {
                $value = ['duty', 'homeroom'];
            } elseif ($value === 'piket' || $value === 'duty') {
                $value = ['duty'];
            } elseif ($value === 'wali' || $value === 'homeroom') {
                $value = ['homeroom'];
            } else {
                $value = [$value];
            }
        } elseif ($value instanceof \Illuminate\Support\Collection) {
            $value = $value->toArray();
        }

        if (is_array($value)) {
            $normalized = array_map(function ($item) {
                if ($item instanceof \App\Enums\TeacherType) {
                    return $item->value;
                }
                if ($item === 'wali') return 'homeroom';
                if ($item === 'piket') return 'duty';
                return (string) $item;
            }, $value);
            $this->attributes['teacher_type'] = json_encode(array_values(array_unique($normalized)));
            return;
        }

        $this->attributes['teacher_type'] = json_encode($value);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<SchoolClass, $this> */
    public function schoolClasses(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'teacher_id');
    }

    public function dutySchedules(): HasMany
    {
        return $this->hasMany(DutySchedule::class);
    }

    public function isHomeroom(): bool
    {
        return $this->teacher_type && $this->teacher_type->contains(\App\Enums\TeacherType::HOMEROOM);
    }

    public function isDuty(): bool
    {
        return $this->teacher_type && $this->teacher_type->contains(\App\Enums\TeacherType::DUTY);
    }
}
