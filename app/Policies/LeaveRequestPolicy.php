<?php

namespace App\Policies;

use App\Models\User;

class LeaveRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher', 'guardian']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['student', 'guardian']);
    }

    public function verify(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher']);
    }
}
