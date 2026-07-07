<?php

namespace App\Actions;

use App\Models\Student;
use App\Models\User;

class GetStudentFromUser
{
    public function handle(User $user): ?Student
    {
        return Student::where('user_id', $user->id)->first();
    }
}
