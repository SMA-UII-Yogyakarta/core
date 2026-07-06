<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class AttendanceMarked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Attendance $attendance,
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('attendance-monitoring'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->attendance->id,
            'student_id' => $this->attendance->student_id,
            'student_name' => $this->attendance->student?->name,
            'status' => $this->attendance->status,
            'check_in_time' => $this->attendance->check_in_time,
            'attendance_date' => $this->attendance->attendance_date->toDateString(),
            'class_name' => $this->attendance->student?->class?->name,
        ];
    }
}
