<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuardianRequest;
use App\Http\Requests\UpdateGuardianRequest;
use App\Models\Guardian;
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
        $this->authorize('viewAny', Guardian::class);

        $guardians = $this->guardianService->paginate(
            request()->only(['search', 'has_student']),
        );

        return Inertia::render('Admin/MasterData', [
            'activeTab' => 'guardians',
            'guardians' => $guardians,
            'filters' => request()->only(['search', 'has_student']),
        ]);
    }

    public function store(StoreGuardianRequest $request)
    {
        $this->authorize('create', Guardian::class);

        $this->guardianService->create($request->validated());
        return redirect()->back()->with('success', __('messages.guardian_added'));
    }

    public function update(UpdateGuardianRequest $request, int $id)
    {
        $this->authorize('update', Guardian::class);

        $this->guardianService->update($id, $request->validated());
        return redirect()->back()->with('success', __('messages.guardian_updated'));
    }

    public function destroy(int $id)
    {
        $this->authorize('delete', Guardian::class);

        $this->guardianService->delete($id);
        return redirect()->back()->with('success', __('messages.guardian_deleted'));
    }

    public function bulkDestroy(\Illuminate\Http\Request $request)
    {
        $this->authorize('delete', Guardian::class);

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:guardians,id',
        ]);

        $count = $this->guardianService->bulkDelete($validated['ids']);

        return redirect()->back()->with(
            'success',
            $count . ' wali murid terpilih berhasil dihapus.',
        );
    }
}
