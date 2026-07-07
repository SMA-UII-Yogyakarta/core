<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $password = 'secret123';

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'username' => 'testuser',
            'password' => bcrypt($this->password),
            'role' => 'admin',
        ]);
    }

    public function test_web_login_page_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_web_login_success(): void
    {
        $response = $this->post('/login', [
            'username' => 'testuser',
            'password' => $this->password,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    public function test_web_login_fails_with_wrong_password(): void
    {
        $response = $this->post('/login', [
            'username' => 'testuser',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_web_login_fails_with_nonexistent_user(): void
    {
        $response = $this->post('/login', [
            'username' => 'nonexistent',
            'password' => $this->password,
        ]);

        $response->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_web_logout_success(): void
    {
        $this->actingAs($this->user);

        $response = $this->post('/logout');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_api_login_returns_token(): void
    {
        $response = $this->postJson('/api/login', [
            'username' => 'testuser',
            'password' => $this->password,
            'device_name' => 'testing',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_api_login_fails_with_wrong_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'username' => 'testuser',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_api_logout_revokes_token(): void
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertStatus(200);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $this->user->id,
        ]);
    }

    public function test_api_user_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_web_dashboard_redirects_guest_to_login(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_web_dashboard_accessible_when_authenticated(): void
    {
        $this->actingAs($this->user);

        $response = $this->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_api_refresh_returns_new_token(): void
    {
        $token = $this->user->createToken('test-device')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/refresh');

        $response->assertStatus(200)
            ->assertJsonStructure(['token']);

        $this->assertNotSame($token, $response->json('token'));
    }

    public function test_api_refresh_revokes_old_token(): void
    {
        $tokenModel = $this->user->createToken('test-device');
        $plainText = $tokenModel->plainTextToken;
        $tokenId = $tokenModel->accessToken->id;

        $this->withHeader('Authorization', 'Bearer ' . $plainText)
            ->postJson('/api/refresh');

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenId,
        ]);
    }

    public function test_api_sessions_lists_active_tokens(): void
    {
        $token1 = $this->user->createToken('device-1')->plainTextToken;
        $this->user->createToken('device-2');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->getJson('/api/sessions');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'sessions')
            ->assertJsonStructure([
                'sessions' => [
                    '*' => ['id', 'device_name', 'created_at', 'last_used_at', 'expires_at', 'is_current'],
                ],
            ]);
    }

    public function test_api_sessions_marks_current_token(): void
    {
        $token = $this->user->createToken('current-device')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/sessions');

        $current = collect($response->json('sessions'))->firstWhere('is_current', true);
        $this->assertNotNull($current);
        $this->assertSame('current-device', $current['device_name']);
    }

    public function test_api_revoke_session_removes_token(): void
    {
        $token1 = $this->user->createToken('keep')->plainTextToken;
        $token2 = $this->user->createToken('revoke-me');
        $token2Id = $token2->accessToken->id;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token1)
            ->deleteJson('/api/sessions/' . $token2Id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $token2Id,
        ]);
    }

    public function test_api_revoke_session_returns_404_for_invalid_id(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/sessions/99999');

        $response->assertStatus(404);
    }

    public function test_api_refresh_requires_authentication(): void
    {
        $response = $this->postJson('/api/refresh');

        $response->assertStatus(401);
    }

    public function test_api_sessions_requires_authentication(): void
    {
        $response = $this->getJson('/api/sessions');

        $response->assertStatus(401);
    }

    public function test_token_has_expiration_set(): void
    {
        $response = $this->postJson('/api/login', [
            'username' => 'testuser',
            'password' => $this->password,
            'device_name' => 'expirable',
        ]);

        $response->assertStatus(200);

        $token = $this->user->tokens()->where('name', 'expirable')->first();
        $this->assertNotNull($token);
        $this->assertNotNull($token->expires_at);
    }

    public function test_api_refresh_uses_rate_limiter(): void
    {
        $token = $this->user->createToken('rate-test')->plainTextToken;

        // Use up the 3 rate limit quota
        for ($i = 0; $i < 3; $i++) {
            $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                ->postJson('/api/refresh');

            $token = $response->json('token');
        }

        // 4th attempt should hit rate limiter
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/refresh');

        $response->assertStatus(429);
    }
}
