<?php

namespace App\Services;

use App\Models\LeaveRequest;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveRequestService
{
    /**
     * @param  array<int, int>|null  $classIds  null means school-wide scope
     */
    public function paginate(array $filters = [], int $perPage = 20, ?array $classIds = null): LengthAwarePaginator
    {
        return LeaveRequest::query()
            ->with(['student.user', 'student.class', 'guardian'])
            ->when($filters['student_id'] ?? null, fn ($q, $v) => $q->where('student_id', $v))
            ->when($filters['guardian_id'] ?? null, fn ($q, $v) => $q->where('guardian_id', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('approval_status', $v))
            ->when($filters['category'] ?? null, fn ($q, $v) => $q->where('category', $v))
            ->when($classIds !== null, fn ($q) => $q->whereHas(
                'student',
                fn ($sq) => $sq->whereIn('class_id', $classIds),
            ))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?LeaveRequest
    {
        return LeaveRequest::with(['student.user', 'student.class', 'guardian'])->find($id);
    }

    public function create(array $data): LeaveRequest
    {
        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
                $leave = LeaveRequest::create([
                    'student_id' => $data['student_id'],
                    'guardian_id' => $data['guardian_id'],
                    'category' => $data['category'],
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'],
                    'description' => $data['description'] ?? null,
                    'document_url' => $data['document_url'] ?? null,
                    'approval_status' => 'Pending',
                ]);

                \Illuminate\Support\Facades\Log::info('Leave request created', [
                    'leave_request_id' => $leave->id,
                    'student_id' => $data['student_id'],
                    'guardian_id' => $data['guardian_id'],
                    'category' => $data['category'],
                ]);

                return $leave;
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to create leave request', [
                'student_id' => $data['student_id'] ?? null,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function verify(int $id, string $status, ?string $reason = null): LeaveRequest
    {
        if (! in_array($status, ['Approved', 'Rejected'], true)) {
            throw new \InvalidArgumentException('Status must be Approved or Rejected.');
        }

        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($id, $status, $reason) {
                $leave = LeaveRequest::findOrFail($id);
                $data = ['approval_status' => $status];
                if ($status === 'Rejected' && $reason) {
                    $data['rejection_reason'] = $reason;
                } elseif ($status === 'Approved') {
                    $data['rejection_reason'] = null;
                }
                $leave->update($data);

                \Illuminate\Support\Facades\Log::info('Leave request verified', [
                    'leave_request_id' => $id,
                    'status' => $status,
                    'reason' => $reason,
                ]);

                return $leave->fresh(['student.user', 'student.class', 'guardian']);
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to verify leave request', [
                'leave_request_id' => $id,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * @param  list<int>  $ids
     * @param  string  $status
     */
    public function bulkVerify(array $ids, string $status, ?string $reason = null): int
    {
        if (! in_array($status, ['Approved', 'Rejected'], true)) {
            throw new \InvalidArgumentException('Status must be Approved or Rejected.');
        }

        $data = ['approval_status' => $status];
        if ($status === 'Rejected' && $reason) {
            $data['rejection_reason'] = $reason;
        } elseif ($status === 'Approved') {
            $data['rejection_reason'] = null;
        }

        return LeaveRequest::whereIn('id', array_unique($ids))->update($data);
    }

    public function revert(int $id): LeaveRequest
    {
        $leave = LeaveRequest::findOrFail($id);
        $leave->update(['approval_status' => 'Pending']);

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
