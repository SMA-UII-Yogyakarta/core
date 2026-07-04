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
 * @property string|null $phone
 * @property string|null $address
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveRequest> $leaveRequests
 * @property-read int|null $leave_requests_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Student> $students
 * @property-read int|null $students_count
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\GuardianFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Guardian whereUserId($value)
 * @mixin \Eloquent
 */
class Guardian extends Model
{
    use HasFactory;

    protected $table = 'guardians';

    protected $fillable = ['user_id', 'name', 'phone', 'address'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
