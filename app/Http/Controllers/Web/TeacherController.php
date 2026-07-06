<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
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
        $teachers = $this->teacherService->paginate(
            request()->only(['search']),
        );

        return Inertia::render('Admin/MasterData', [
            'activeTab' => 'guru',
            'teachers' => $teachers,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(StoreTeacherRequest $request)
    {
        $this->teacherService->create($request->validated());
        return redirect()->back()->with('success', 'Guru berhasil ditambahkan.');
    }

    public function update(UpdateTeacherRequest $request, int $id)
    {
        $this->teacherService->update($id, $request->validated());
        return redirect()->back()->with('success', 'Data guru berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $this->teacherService->delete($id);
        return redirect()->back()->with('success', 'Guru berhasil dihapus.');
    }
}
