<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
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
        $classes = $this->schoolClassService->paginate(
            request()->only(['search']),
        );

        return Inertia::render('Admin/DataMaster', [
            'activeTab' => 'kelas',
            'schoolClasses' => $classes,
            'filters' => request()->only(['search']),
        ]);
    }

    /**
     * Standalone Master Kelas page (separate from DataMaster).
     */
    public function masterIndex()
    {
        $classes = $this->schoolClassService->paginate(
            request()->only(['search']),
        );

        $teachers = Teacher::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/MasterKelas', [
            'schoolClasses' => $classes,
            'teachers' => $teachers,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'level' => 'nullable|string|in:X,XI,XII',
            'teacher_id' => 'nullable|exists:teachers,id',
        ]);

        $validated['level'] = $validated['level'] ?? 'X';
        $this->schoolClassService->create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Kelas berhasil ditambahkan.',
            ]);
        }

        return redirect()
            ->back()
            ->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'level' => 'nullable|string|in:X,XI,XII',
            'teacher_id' => 'nullable|exists:teachers,id',
        ]);

        $this->schoolClassService->update($id, $validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Data kelas berhasil diperbarui.',
            ]);
        }

        return redirect()
            ->back()
            ->with('success', 'Data kelas berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $this->schoolClassService->delete($id);
        return redirect()->back()->with('success', 'Kelas berhasil dihapus.');
    }
}
