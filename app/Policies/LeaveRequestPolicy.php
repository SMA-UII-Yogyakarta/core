<?php

namespace App\Policies;

use App\Models\User;

class LeaveRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher', 'guardian'], true);
    }

    public function view(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher', 'guardian'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['student', 'guardian'], true);
    }

    /**
     * Verification rights. Teacher subtype (wali) is enforced by
     * PermissionRegistry via AuthorizeRoute middleware; data scoping
     * is enforced by HomeroomScope in the controller.
     */
    public function verify(User $user): bool
    {
        return in_array($user->role, ['admin', 'teacher'], true);
    }
}
