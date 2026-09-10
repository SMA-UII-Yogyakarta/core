<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceOverride extends Model
{
    protected $fillable = [
        'student_id',
        'user_id',
        'attendance_date',
        'original_status',
        'new_status',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
