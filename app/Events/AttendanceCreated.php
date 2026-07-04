<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceCreated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public Attendance $attendance;

    /**
     * Create a new event instance.
     */
    public function __construct(Attendance $attendance)
    {
        $this->attendance = $attendance;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $classId = $this->attendance->student->class_id;

        return [
            new Channel("monitoring.{$classId}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'attendance.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->attendance->id,
            'student_id' => $this->attendance->student_id,
            'student_name' => $this->attendance->student->name,
            'student_nis' => $this->attendance->student->nis,
            'class_id' => $this->attendance->student->class_id,
            'class_name' => $this->attendance->student->class->name ?? null,
            'status' => $this->attendance->status,
            'check_in_time' => $this->attendance->check_in_time,
            'latitude' => $this->attendance->latitude,
            'longitude' => $this->attendance->longitude,
            'attendance_date' => $this->attendance->attendance_date->toDateString(),
        ];
    }
}
