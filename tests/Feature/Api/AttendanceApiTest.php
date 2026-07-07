<?php

namespace Tests\Feature\Api;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_today_returns_200_when_student_exists(): void
    {
        $schoolClass = SchoolClass::factory()->create();
        $user = User::factory()->create();
        $student = Student::factory()->create([
            'user_id' => $user->id,
            'class_id' => $schoolClass->id,
        ]);

        $response = $this->actingAs($user)->getJson('/api/attendances/today');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'attendance',
            'student' => ['id', 'name', 'class'],
        ]);
    }

    public function test_check_in_returns_404_when_student_not_found(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/attendances/check-in', [
            'latitude' => -7.123,
            'longitude' => 110.456,
        ]);

        $response->assertStatus(404);
        $response->assertJson([
            'message' => 'Siswa tidak ditemukan.',
        ]);
    }
}
