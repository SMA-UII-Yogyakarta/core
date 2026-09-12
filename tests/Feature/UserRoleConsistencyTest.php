<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

/**
 * D1 Opsi A — consistency tests ensuring users.role column
 * and Spatie roles stay in sync at all times (single source of truth).
 *
 * Every user created with role=X must:
 *  - have hasRole('X', 'web') === true
 *  - have roles->first()->guard_name === 'web'
 *  - NOT have any stale/duplicate Spatie roles
 *  - survive auth:sanctum middleware without GuardDoesNotMatch
 */
class UserRoleConsistencyTest extends TestCase
{
    use RefreshDatabase;

    private const ALL_ROLES = ['admin', 'teacher', 'student', 'guardian'];

    private function createUserWithRole(string $role): User
    {
        return User::create([
            'username' => uniqid("{$role}-"),
            'name' => ucfirst($role),
            'email' => uniqid("{$role}@") . 'smauiiyk.sch.id',
            'password' => 'password',
            'role' => $role,
        ]);
    }

    public function test_all_roles_sync_to_spatie_with_guard_web(): void
    {
        $users = array_map(fn (string $r) => $this->createUserWithRole($r), self::ALL_ROLES);

        foreach ($users as $user) {
            $this->assertTrue(
                $user->hasRole($user->role, 'web'),
                "User {$user->username} (role={$user->role}) missing Spatie role with guard 'web'",
            );
            $this->assertSame(
                'web',
                $user->roles->first()->guard_name,
                "User {$user->username} has Spatie role with wrong guard_name",
            );
            $this->assertSame(
                1,
                $user->roles->count(),
                "User {$user->username} has {$user->roles->count()} Spatie roles (expected exactly 1)",
            );
        }
    }

    public function test_role_change_removes_old_spatie_role(): void
    {
        $user = $this->createUserWithRole('student');
        $this->assertTrue($user->hasRole('student', 'web'));

        $user->update(['role' => 'teacher']);

        $fresh = $user->fresh();
        $this->assertTrue($fresh->hasRole('teacher', 'web'));
        $this->assertFalse($fresh->hasRole('student', 'web'));
        $this->assertSame(1, $fresh->roles->count());
    }

    public function test_unrelated_update_does_not_touch_spatie_role(): void
    {
        $user = $this->createUserWithRole('guardian');
        $user->update(['name' => 'Changed Name']);

        $fresh = $user->fresh();
        $this->assertTrue($fresh->hasRole('guardian', 'web'));
        $this->assertFalse($fresh->hasRole('student', 'web'));
    }

    public function test_role_assignment_survives_santcum_request_context(): void
    {
        Auth::shouldUse('sanctum');

        $user = $this->createUserWithRole('student');

        $this->assertTrue($user->hasRole('student', 'web'));
        $this->assertSame('web', $user->roles->first()->guard_name);
    }

    public function test_has_role_returns_true_with_explicit_guard_after_sanctum_switch(): void
    {
        Auth::shouldUse('sanctum');

        $users = array_map(fn (string $r) => $this->createUserWithRole($r), self::ALL_ROLES);

        foreach ($users as $user) {
            $this->assertTrue(
                $user->hasRole($user->role, 'web'),
                "hasRole failed for {$user->role} after sanctum guard switch",
            );
        }
    }

    public function test_no_duplicate_spatie_roles_after_multiple_saves(): void
    {
        $user = $this->createUserWithRole('teacher');
        $user->update(['name' => 'Update 1']);
        $user->update(['name' => 'Update 2']);
        $user->update(['name' => 'Update 3']);

        $fresh = $user->fresh();
        $this->assertSame(1, $fresh->roles->count(), 'Multiple saves should not create duplicate Spatie roles');
        $this->assertTrue($fresh->hasRole('teacher', 'web'));
    }
}
