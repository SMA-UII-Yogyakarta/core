<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuardianRequest;
use App\Http\Requests\UpdateGuardianRequest;
use App\Services\GuardianService;
use Inertia\Inertia;

class GuardianController extends Controller
{
    public function __construct(
        protected GuardianService $guardianService,
    ) {
    }

    public function index()
    {
        $guardians = $this->guardianService->paginate(
            request()->only(['search']),
        );

        return Inertia::render('Admin/DataMaster', [
            'activeTab' => 'wali',
            'guardians' => $guardians,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(StoreGuardianRequest $request)
    {
        $this->guardianService->create($request->validated());
        return redirect()->back()->with('success', 'Wali murid berhasil ditambahkan.');
    }

    public function update(UpdateGuardianRequest $request, int $id)
    {
        $this->guardianService->update($id, $request->validated());
        return redirect()->back()->with('success', 'Data wali murid berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $this->guardianService->delete($id);
        return redirect()->back()->with('success', 'Wali murid berhasil dihapus.');
    }
}
