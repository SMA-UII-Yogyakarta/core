<?php

namespace App\Services;

use App\Models\LeaveRequest;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveRequestService
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return LeaveRequest::query()
            ->with(['student.user', 'student.class', 'guardian'])
            ->when($filters['student_id'] ?? null, fn ($q, $v) => $q->where('student_id', $v))
            ->when($filters['guardian_id'] ?? null, fn ($q, $v) => $q->where('guardian_id', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('approval_status', $v))
            ->when($filters['category'] ?? null, fn ($q, $v) => $q->where('category', $v))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?LeaveRequest
    {
        return LeaveRequest::with(['student.user', 'student.class', 'guardian'])->find($id);
    }

    public function create(array $data): LeaveRequest
    {
        return LeaveRequest::create([
            'student_id' => $data['student_id'],
            'guardian_id' => $data['guardian_id'],
            'category' => $data['category'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'document_url' => $data['document_url'] ?? null,
            'approval_status' => 'Pending',
        ]);
    }

    public function verify(int $id, string $status): LeaveRequest
    {
        if (! in_array($status, ['Approved', 'Rejected'])) {
            throw new \InvalidArgumentException('Status harus Approved atau Rejected.');
        }

        $leave = LeaveRequest::findOrFail($id);
        $leave->update(['approval_status' => $status]);

        return $leave->fresh(['student.user', 'student.class', 'guardian']);
    }

    public function pending(): LengthAwarePaginator
    {
        return LeaveRequest::with(['student.user', 'student.class', 'guardian'])
            ->where('approval_status', 'Pending')
            ->latest()
            ->paginate(20);
    }
}
