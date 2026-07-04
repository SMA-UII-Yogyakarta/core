<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $student_id
 * @property int $guardian_id
 * @property string $category
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon $end_date
 * @property string|null $document_url
 * @property string $approval_status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Guardian $guardian
 * @property-read \App\Models\Student $student
 * @method static \Database\Factories\LeaveRequestFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereApprovalStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereDocumentUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereGuardianId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereStudentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class LeaveRequest extends Model
{
    use HasFactory;

    protected $table = 'leave_requests';

    protected $fillable = [
        'student_id',
        'guardian_id',
        'category',
        'start_date',
        'end_date',
        'document_url',
        'approval_status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }
}
