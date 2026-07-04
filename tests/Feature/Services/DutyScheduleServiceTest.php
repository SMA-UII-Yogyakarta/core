<?php

namespace Tests\Feature\Services;

use App\Models\DutySchedule;
use App\Models\Teacher;
use App\Models\User;
use App\Services\DutyScheduleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DutyScheduleServiceTest extends TestCase
{
    use RefreshDatabase;

    protected DutyScheduleService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(DutyScheduleService::class);
    }

    public function test_create_creates_duty_schedule(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::create([
            'user_id' => $user->id,
            'name' => 'Test Teacher',
            'teacher_code' => 'T001',
        ]);

        $schedule = $this->service->create([
            'teacher_id' => $teacher->id,
            'duty_day' => 'Monday',
        ]);

        $this->assertEquals($teacher->id, $schedule->teacher_id);
        $this->assertEquals('Monday', $schedule->duty_day);
    }

    public function test_findByTeacher_returns_schedules(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::create([
            'user_id' => $user->id,
            'name' => 'Test Teacher',
            'teacher_code' => 'T001',
        ]);

        DutySchedule::create(['teacher_id' => $teacher->id, 'duty_day' => 'Monday']);
        DutySchedule::create(['teacher_id' => $teacher->id, 'duty_day' => 'Wednesday']);

        $schedules = $this->service->findByTeacher($teacher->id);

        $this->assertCount(2, $schedules);
    }

    public function test_update_modifies_schedule(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::create([
            'user_id' => $user->id,
            'name' => 'Test Teacher',
            'teacher_code' => 'T001',
        ]);

        $schedule = DutySchedule::create([
            'teacher_id' => $teacher->id,
            'duty_day' => 'Monday',
        ]);

        $updated = $this->service->update($schedule->id, [
            'duty_day' => 'Friday',
        ]);

        $this->assertEquals('Friday', $updated->duty_day);
    }

    public function test_delete_removes_schedule(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::create([
            'user_id' => $user->id,
            'name' => 'Test Teacher',
            'teacher_code' => 'T001',
        ]);

        $schedule = DutySchedule::create([
            'teacher_id' => $teacher->id,
            'duty_day' => 'Monday',
        ]);

        $this->service->delete($schedule->id);

        $this->assertDatabaseMissing('duty_schedules', ['id' => $schedule->id]);
    }

    public function test_findAll_returns_all_schedules(): void
    {
        $user1 = User::factory()->create(['role' => 'teacher']);
        $teacher1 = Teacher::create(['user_id' => $user1->id, 'name' => 'Teacher 1', 'teacher_code' => 'T001']);

        $user2 = User::factory()->create(['role' => 'teacher']);
        $teacher2 = Teacher::create(['user_id' => $user2->id, 'name' => 'Teacher 2', 'teacher_code' => 'T002']);

        DutySchedule::create(['teacher_id' => $teacher1->id, 'duty_day' => 'Monday']);
        DutySchedule::create(['teacher_id' => $teacher2->id, 'duty_day' => 'Tuesday']);

        $schedules = $this->service->findAll();

        $this->assertCount(2, $schedules);
    }
}
