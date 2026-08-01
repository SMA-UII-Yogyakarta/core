<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Teacher;
use App\Services\SchoolClassService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolClassController extends Controller
{
    public function __construct(
        protected SchoolClassService $schoolClassService,
    ) {
    }

    public function index()
    {
        $this->authorize('viewAny', SchoolClass::class);

        $classes = $this->schoolClassService->paginate(
            request()->only(['search']),
        );

        $assignedTeacherIds = SchoolClass::whereNotNull('teacher_id')
            ->pluck('teacher_id')
            ->unique();

        $availableTeachers = Teacher::whereNotIn('id', $assignedTeacherIds)
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $total = $classes->total();
        $isClientMode = $total <= 100;

        return Inertia::render('Admin/MasterData', [
            'activeTab' => 'classes',
            'schoolClasses' => $classes,
            'allTeachers' => $availableTeachers,
            'searchConfig' => [
                'mode' => $isClientMode ? 'client' : 'server',
                'allData' => $isClientMode ? $classes->all() : null,
            ],
            'filters' => request()->only(['search']),
        ]);
    }

    /**
     * Standalone Master Kelas page (separate from DataMaster).
     */
    public function masterIndex()
    {
        $this->authorize('viewAny', SchoolClass::class);

        $classes = $this->schoolClassService->paginate(
            request()->only(['search']),
        );

        $teachers = Teacher::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/MasterClasses', [
            'schoolClasses' => $classes,
            'teachers' => $teachers,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', SchoolClass::class);

        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:school_classes,name',
            'level' => 'nullable|string|in:X,XI,XII',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
        ]);

        $validated['level'] = $validated['level'] ?? 'X';
        $this->schoolClassService->create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Class added successfully.',
            ]);
        }

        return redirect()
            ->back()
            ->with('success', 'Class added successfully.');
    }

    public function update(Request $request, int $id)
    {
        $this->authorize('update', SchoolClass::class);

        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:school_classes,name,' . $id,
            'level' => 'nullable|string|in:X,XI,XII',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
        ]);

        $this->schoolClassService->update($id, $validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Class data updated successfully.',
            ]);
        }

        return redirect()
            ->back()
            ->with('success', 'Class data updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->authorize('delete', SchoolClass::class);

        $this->schoolClassService->delete($id);
        return redirect()->back()->with('success', 'Class deleted successfully.');
    }
}
