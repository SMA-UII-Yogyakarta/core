<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileAvatarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Storage::fake('s3');
    }

    public function test_all_user_roles_can_upload_avatar_successfully(): void
    {
        $roles = ['admin', 'teacher', 'student', 'guardian'];

        foreach ($roles as $role) {
            $user = User::factory()->create(['role' => $role]);

            $file = UploadedFile::fake()->image("{$role}_avatar.jpg", 300, 300)->size(500);

            $response = $this->actingAs($user)
                ->post('/profile/avatar', [
                    'avatar' => $file,
                ]);

            $response->assertSessionHas('success', 'Foto profil berhasil diperbarui.');

            $user->refresh();
            $this->assertNotNull($user->avatar);
        }
    }

    public function test_user_can_delete_their_avatar(): void
    {
        $user = User::factory()->create([
            'role' => 'student',
            'avatar' => 'avatars/2026-09-02/1_test.jpg',
        ]);

        $response = $this->actingAs($user)
            ->delete('/profile/avatar');

        $response->assertSessionHas('success', 'Foto profil berhasil dihapus.');

        $user->refresh();
        $this->assertNull($user->avatar);
    }

    public function test_avatar_upload_rejects_oversized_files(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);

        // 3MB file (max is 2MB)
        $file = UploadedFile::fake()->image('large.jpg')->size(3072);

        $response = $this->actingAs($user)
            ->post('/profile/avatar', [
                'avatar' => $file,
            ]);

        $response->assertSessionHasErrors(['avatar']);
    }

    public function test_avatar_upload_rejects_invalid_file_types(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user)
            ->post('/profile/avatar', [
                'avatar' => $file,
            ]);

        $response->assertSessionHasErrors(['avatar']);
    }

    public function test_profile_update_can_remove_avatar_via_flag(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'user@smauii.sch.id',
            'avatar' => 'avatars/2026-09-02/1_test.jpg',
        ]);

        $response = $this->actingAs($user)
            ->put('/profile', [
                'name' => 'Updated Name',
                'email' => 'user@smauii.sch.id',
                'remove_avatar' => true,
            ]);

        $response->assertSessionHas('success', 'Profil berhasil diperbarui.');

        $user->refresh();
        $this->assertEquals('Updated Name', $user->name);
        $this->assertNull($user->avatar);
    }
}
