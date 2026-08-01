<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuardianRequest;
use App\Http\Requests\UpdateGuardianRequest;
use App\Models\Guardian;
use App\Services\GuardianService;
use Illuminate\Http\JsonResponse;

class GuardianController extends Controller
{
    public function __construct(
        protected GuardianService $guardianService,
    ) {
    }

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Guardian::class);

        return response()->json($this->guardianService->paginate(
            request()->only(['search']),
        ));
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', Guardian::class);

        $guardian = $this->guardianService->findById($id);
        if (! $guardian) {
            return response()->json(['message' => 'Guardian not found.'], 404);
        }
        return response()->json($guardian);
    }

    public function store(StoreGuardianRequest $request): JsonResponse
    {
        $this->authorize('create', Guardian::class);

        return response()->json($this->guardianService->create($request->validated()), 201);
    }

    public function update(UpdateGuardianRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', Guardian::class);

        return response()->json($this->guardianService->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', Guardian::class);

        $this->guardianService->delete($id);
        return response()->json(['message' => 'Guardian deleted successfully.']);
    }
}
