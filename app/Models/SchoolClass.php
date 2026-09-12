<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $teacher_id
 * @property string $name
 * @property string $level
 * @property string $academic_year
 * @property int $capacity
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Student> $students
 * @property-read int|null $students_count
 * @property-read \App\Models\Teacher|null $teacher
 * @method static \Database\Factories\SchoolClassFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass whereAcademicYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass whereLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass whereTeacherId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SchoolClass whereCapacity($value)
 * @mixin \Eloquent
 */
class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'school_classes';

    protected $fillable = ['name', 'level', 'academic_year', 'teacher_id', 'capacity'];

    protected $appends = ['full_name'];

    public function getFullNameAttribute(): string
    {
        $level = trim((string) ($this->level ?? ''));
        $name = trim((string) ($this->name ?? ''));

        if ($level === '') {
            return $name;
        }

        if (str_starts_with(strtoupper($name), strtoupper($level) . '-')) {
            return $name;
        }

        return "{$level}-{$name}";
    }

    public static function currentAcademicYear(): string
    {
        $now = now();
        $year = $now->year;

        return $now->month >= 7 ? "{$year}/" . ($year + 1) : ($year - 1) . "/{$year}";
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_id');
    }
}
