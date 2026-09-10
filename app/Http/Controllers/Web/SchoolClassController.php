<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolClassRequest;
use App\Http\Requests\UpdateSchoolClassRequest;
use App\Models\SchoolClass;
use App\Models\Teacher;
use App\Services\SchoolClassService;
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
            'classOptions' => $classes->map(fn ($c) => ['id' => $c->id, 'name' => $c->full_name])->all(),
            'searchConfig' => [
                'mode' => $isClientMode ? 'client' : 'server',
                'allData' => $isClientMode ? $classes->all() : null,
            ],
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(StoreSchoolClassRequest $request)
    {
        $this->authorize('create', SchoolClass::class);

        $validated = $request->validated();
        $validated['level'] = $validated['level'] ?? 'X';
        $validated['academic_year'] = $validated['academic_year'] ?: SchoolClass::currentAcademicYear();
        $this->schoolClassService->create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => __('messages.class_added'),
            ]);
        }

        return redirect()
            ->back()
            ->with('success', __('messages.class_added'));
    }

    public function update(UpdateSchoolClassRequest $request, int $id)
    {
        $this->authorize('update', SchoolClass::class);

        $validated = $request->validated();
        $validated['academic_year'] = $validated['academic_year'] ?: SchoolClass::currentAcademicYear();
        $this->schoolClassService->update($id, $validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => __('messages.class_updated'),
            ]);
        }

        return redirect()
            ->back()
            ->with('success', __('messages.class_updated'));
    }

    public function destroy(int $id)
    {
        $this->authorize('delete', SchoolClass::class);

        $this->schoolClassService->delete($id);
        return redirect()->back()->with('success', __('messages.class_deleted'));
    }

    public function bulkDestroy(\Illuminate\Http\Request $request)
    {
        $this->authorize('delete', SchoolClass::class);

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:school_classes,id',
        ]);

        $count = $this->schoolClassService->bulkDelete($validated['ids']);

        return redirect()->back()->with(
            'success',
            $count . ' kelas terpilih berhasil dihapus.',
        );
    }
}
