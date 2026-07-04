<?php

namespace App\Http\Controllers\Web\WaliMurid;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use App\Services\LeaveRequestService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PengajuanIzinController extends Controller
{
    public function __construct(
        protected LeaveRequestService $leaveRequestService,
    ) {
    }

    public function index()
    {
        $user = Auth::user();
        $guardian = Guardian::with(['students'])->where('user_id', $user->id)->firstOrFail();

        $leaveRequests = \App\Models\LeaveRequest::with(['student'])
            ->where('guardian_id', $guardian->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('WaliMurid/PengajuanIzin', [
            'guardian' => $guardian,
            'students' => $guardian->students,
            'leaveRequests' => $leaveRequests,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'category' => 'required|string|in:Sick,Event,Competition,Other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string|max:500',
            'document_url' => 'nullable|string',
        ]);

        $user = Auth::user();
        $guardian = Guardian::where('user_id', $user->id)->firstOrFail();

        $this->leaveRequestService->create([
            'student_id' => $validated['student_id'],
            'guardian_id' => $guardian->id,
            'category' => $validated['category'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'document_url' => $validated['document_url'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Pengajuan izin berhasil dikirim.');
    }
}
