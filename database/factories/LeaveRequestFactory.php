<?php

namespace Database\Factories;

use App\Models\LeaveRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeaveRequestFactory extends Factory
{
    protected $model = LeaveRequest::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-2 weeks', '+1 week')->format('Y-m-d');

        return [
            'category' => fake()->randomElement(['Sick', 'Event', 'Competition']),
            'start_date' => $start,
            'end_date' => fake()->dateTimeBetween($start, $start . ' +3 days')->format('Y-m-d'),
            'document_url' => null,
            'approval_status' => fake()->randomElement(['Pending', 'Approved', 'Rejected']),
        ];
    }
}
