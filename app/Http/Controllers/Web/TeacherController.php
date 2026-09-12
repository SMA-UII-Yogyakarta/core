<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Services\TeacherService;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function __construct(
        protected TeacherService $teacherService,
    ) {
    }

    public function index()
    {
        $this->authorize('viewAny', Teacher::class);

        $teachers = $this->teacherService->paginate(
            request()->only(['search', 'teacher_type']),
        );

        return Inertia::render('Admin/MasterData', [
            'activeTab' => 'guru',
            'teachers' => $teachers,
            'filters' => request()->only(['search', 'teacher_type']),
        ]);
    }

    public function store(StoreTeacherRequest $request)
    {
        $this->authorize('create', Teacher::class);

        $this->teacherService->create($request->validated());
        return redirect()->back()->with('success', __('messages.teacher_added'));
    }

    public function update(UpdateTeacherRequest $request, int $id)
    {
        $this->authorize('update', Teacher::class);

        $this->teacherService->update($id, $request->validated());
        return redirect()->back()->with('success', __('messages.teacher_updated'));
    }

    public function destroy(int $id)
    {
        $this->authorize('delete', Teacher::class);

        $this->teacherService->delete($id);
        return redirect()->back()->with('success', __('messages.teacher_deleted'));
    }

    public function bulkDestroy(\Illuminate\Http\Request $request)
    {
        $this->authorize('delete', Teacher::class);

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:teachers,id',
        ]);

        $count = $this->teacherService->bulkDelete($validated['ids']);

        return redirect()->back()->with(
            'success',
            $count . ' guru terpilih berhasil dihapus.',
        );
    }
}
