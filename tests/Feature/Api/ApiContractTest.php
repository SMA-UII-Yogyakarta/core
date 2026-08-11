<?php

namespace Tests\Feature\Api;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiContractTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Semua route API harus berada di bawah prefix /api/v1/.
     */
    public function test_all_api_routes_are_versioned_under_v1(): void
    {
        $unversioned = collect(app('router')->getRoutes()->getRoutes())
            ->map(fn ($route) => $route->uri())
            ->filter(fn (string $uri) => $uri === 'api' || str_starts_with($uri, 'api/'))
            ->reject(fn (string $uri) => str_starts_with($uri, 'api/v1/'))
            ->values();

        $this->assertTrue(
            $unversioned->isEmpty(),
            'Ditemukan route API tanpa versi: ' . $unversioned->implode(', '),
        );
    }

    /**
     * Envelope sukses: { success, message, errors, data }.
     */
    public function test_success_envelope_shape_on_index(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->getJson('/api/v1/students')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => ['data', 'links', 'meta'],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('errors', null);
    }

    /**
     * Detail resource harus punya field kunci + tanggal ISO 8601.
     */
    public function test_resource_detail_envelope_and_iso8601(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $schoolClass = SchoolClass::factory()->create();
        $user = User::factory()->create(['role' => 'student']);
        $student = Student::factory()->create([
            'user_id' => $user->id,
            'class_id' => $schoolClass->id,
        ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/students/' . $student->id)
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
                'data' => [
                    'id',
                    'nis',
                    'nisn',
                    'name',
                    'birth_date',
                    'status',
                    'class',
                    'guardian',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', $student->name)
            ->assertJsonPath('data.created_at', fn ($value) => (bool) preg_match(
                '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/',
                (string) $value,
            ));
    }

    /**
     * Envelope error 404: { success: false, message, errors, data: null }.
     */
    public function test_not_found_error_envelope_shape(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->getJson('/api/v1/students/999999')
            ->assertNotFound()
            ->assertJsonStructure(['success', 'message', 'errors', 'data'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null);
    }

    public function test_unauthenticated_error_envelope_shape(): void
    {
        $this->getJson('/api/v1/students')
            ->assertStatus(401)
            ->assertJsonStructure(['success', 'message', 'errors', 'data'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null);
    }

    public function test_forbidden_error_envelope_shape(): void
    {
        $user = User::factory()->create(['role' => 'student']);

        $this->actingAs($user)
            ->getJson('/api/v1/students')
            ->assertStatus(403)
            ->assertJsonStructure(['success', 'message', 'errors', 'data'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null);
    }

    public function test_validation_error_envelope_shape(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->postJson('/api/v1/students', [])
            ->assertStatus(422)
            ->assertJsonStructure(['success', 'message', 'errors', 'data'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null)
            ->assertJsonStructure(['errors' => ['nis', 'nisn', 'name', 'class_id']]);
    }

    /**
     * Rate limit (throttle:api-login) harus menambah header limiter
     * dan mengembalikan envelope error 429.
     */
    public function test_rate_limit_headers_and_429_envelope(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/login', [
                'username' => 'unknown',
                'password' => 'wrong',
            ])->assertStatus(422);
        }

        $response = $this->postJson('/api/v1/login', [
            'username' => 'unknown',
            'password' => 'wrong',
        ]);

        $response->assertStatus(429)
            ->assertJsonStructure(['success', 'message', 'errors', 'data'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('data', null);

        $this->assertSame(
            '5',
            $response->headers->get('X-RateLimit-Limit'),
            'Header X-RateLimit-Limit harus ada.',
        );
        $this->assertNotNull(
            $response->headers->get('X-RateLimit-Remaining'),
            'Header X-RateLimit-Remaining harus ada.',
        );
    }
}
