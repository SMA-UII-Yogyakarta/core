<?php

namespace Tests\Feature\Services;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Services\SchoolClassService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolClassServiceTest extends TestCase
{
    use RefreshDatabase;

    protected SchoolClassService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(SchoolClassService::class);
    }

    public function test_create_sets_capacity(): void
    {
        $class = $this->service->create([
            'name' => 'X-A',
            'capacity' => 40,
        ]);

        $this->assertEquals(40, $class->capacity);
    }

    public function test_create_defaults_capacity_to_36(): void
    {
        $class = $this->service->create(['name' => 'X-B']);

        $this->assertDatabaseHas('school_classes', [
            'name' => 'X-B',
            'capacity' => 36,
        ]);
    }

    public function test_update_changes_capacity(): void
    {
        $class = SchoolClass::create(['name' => 'X-C', 'capacity' => 36]);

        $updated = $this->service->update($class->id, ['capacity' => 50]);

        $this->assertEquals(50, $updated->capacity);
    }

    public function test_paginate_includes_students_count(): void
    {
        $class = SchoolClass::create(['name' => 'X-D']);

        for ($i = 0; $i < 3; $i++) {
            $user = User::factory()->create(['role' => 'student']);
            Student::create([
                'user_id' => $user->id,
                'name' => "Student $i",
                'nis' => str_pad((string) $i, 5, '0', STR_PAD_LEFT),
                'nisn' => str_pad((string) $i, 10, '0', STR_PAD_LEFT),
                'class_id' => $class->id,
                'birth_date' => '2010-01-01',
                'enrollment_year' => 2025,
                'status' => 'Active',
            ]);
        }

        $result = $this->service->paginate();

        $this->assertEquals(3, $result->first()->students_count);
    }

    public function test_paginate_includes_capacity(): void
    {
        $class = SchoolClass::create(['name' => 'X-E', 'capacity' => 40]);

        $result = $this->service->paginate();

        $this->assertEquals(40, $result->first()->capacity);
    }

    public function test_find_by_id_includes_students_count(): void
    {
        $class = SchoolClass::create(['name' => 'XI-A']);

        for ($i = 0; $i < 2; $i++) {
            $user = User::factory()->create(['role' => 'student']);
            Student::create([
                'user_id' => $user->id,
                'name' => "Student $i",
                'nis' => str_pad((string) ($i + 100), 5, '0', STR_PAD_LEFT),
                'nisn' => str_pad((string) ($i + 100), 10, '0', STR_PAD_LEFT),
                'class_id' => $class->id,
                'birth_date' => '2010-01-01',
                'enrollment_year' => 2025,
                'status' => 'Active',
            ]);
        }

        $found = $this->service->findById($class->id);

        $this->assertNotNull($found);
        $this->assertEquals(2, $found->students_count);
    }

    public function test_create_accepts_various_capacities(): void
    {
        foreach ([20, 36, 40, 50] as $capacity) {
            $class = $this->service->create([
                'name' => 'Cap-' . $capacity,
                'capacity' => $capacity,
            ]);

            $this->assertEquals($capacity, $class->capacity);
        }
    }
}
