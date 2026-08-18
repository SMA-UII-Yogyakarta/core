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

        $allTeachers = Teacher::select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $total = $classes->total();
        $isClientMode = $total <= 100;

        return Inertia::render('Admin/MasterData', [
            'activeTab' => 'classes',
            'schoolClasses' => $classes,
            'allTeachers' => $allTeachers,
            'classOptions' => $classes->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->all(),
            'searchConfig' => [
                'mode' => $isClientMode ? 'client' : 'server',
                'allData' => $isClientMode ? $classes->all() : null,
            ],
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
