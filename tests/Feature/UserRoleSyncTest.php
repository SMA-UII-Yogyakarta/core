<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_column_is_synced_to_spatie_on_create(): void
    {
        $user = User::create([
            'username' => 'admin1',
            'name' => 'Admin One',
            'email' => 'admin1@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $this->assertTrue($user->hasRole('admin'));
    }

    public function test_role_change_syncs_spatie_role(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $this->assertTrue($user->hasRole('student'));

        $user->update(['role' => 'teacher']);

        $this->assertTrue($user->hasRole('teacher'));
        $this->assertFalse($user->hasRole('student'));
    }

    public function test_unrelated_update_keeps_spatie_role_untouched(): void
    {
        $user = User::factory()->create(['role' => 'guardian']);

        $user->update(['name' => 'Changed Name']);

        $this->assertTrue($user->hasRole('guardian'));
        $this->assertFalse($user->hasRole('teacher'));
    }
}
