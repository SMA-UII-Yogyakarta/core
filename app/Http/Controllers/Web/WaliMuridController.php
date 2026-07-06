<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Services\GuardianService;
use App\Services\LeaveRequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WaliMuridController extends Controller
{
    public function __construct(
        protected GuardianService $guardianService,
        protected LeaveRequestService $leaveRequestService,
    ) {
    }

    public function dashboard()
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->route('dashboard')->with('error', 'Data wali murid tidak ditemukan.');
        }

        $students = $guardian->students()->with('class')->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'class' => $s->class ? ['id' => $s->class->id, 'name' => $s->class->name] : null,
            'nis' => $s->nis,
        ]);

        $stats = null;
        if ($students->isNotEmpty()) {
            $studentIds = $students->pluck('id');
            $totalDays = \App\Models\Attendance::whereIn('student_id', $studentIds)->count();
            $present = \App\Models\Attendance::whereIn('student_id', $studentIds)->where('status', 'Present')->count();
            $late = \App\Models\Attendance::whereIn('student_id', $studentIds)->where('status', 'Late')->count();

            $stats = [
                'total_hari' => $totalDays,
                'hadir' => $present,
                'terlambat' => $late,
                'alpa' => max(0, $totalDays - $present - $late),
                'izin_pending' => LeaveRequest::whereIn('student_id', $studentIds)
                    ->where('approval_status', 'Pending')->count(),
            ];
        }

        $recentLeaves = LeaveRequest::where('guardian_id', $guardian->id)
            ->with('student')
            ->latest()
            ->take(5)
            ->get()
            ->toArray();

        return Inertia::render('WaliMurid/Dashboard', [
            'guardian' => ['id' => $guardian->id, 'name' => $guardian->name],
            'students' => $students,
            'stats' => $stats,
            'recentLeaves' => $recentLeaves,
        ]);
    }

    public function pengajuanIzin()
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->route('dashboard')->with('error', 'Data wali murid tidak ditemukan.');
        }

        $students = $guardian->students()->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
        ]);

        $leaveRequests = $this->leaveRequestService->paginate(['guardian_id' => $guardian->id]);

        return Inertia::render('WaliMurid/PengajuanIzin', [
            'guardian' => [
                'id' => $guardian->id,
                'name' => $guardian->name,
                'students' => $students,
            ],
            'students' => $students,
            'leaveRequests' => $leaveRequests->toArray(),
        ]);
    }

    public function storePengajuanIzin(Request $request)
    {
        $guardian = $this->guardianService->findByUserId(auth()->id());

        if (! $guardian) {
            return redirect()->back()->with('error', 'Data wali murid tidak ditemukan.');
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'category' => 'required|in:Sick,Permission,Other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:500',
        ]);

        $this->leaveRequestService->create([
            'student_id' => $validated['student_id'],
            'guardian_id' => $guardian->id,
            'category' => $validated['category'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'document_url' => null,
        ]);

        return redirect()->route('wali-murid.pengajuan-izin')
            ->with('success', 'Pengajuan izin berhasil dikirim.');
    }
}
