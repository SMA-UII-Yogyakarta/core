<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceOverride extends Model
{
    protected $guarded = ['id'];

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
