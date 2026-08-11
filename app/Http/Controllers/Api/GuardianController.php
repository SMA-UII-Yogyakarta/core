<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuardianRequest;
use App\Http\Requests\UpdateGuardianRequest;
use App\Http\Resources\GuardianResource;
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

        $guardians = $this->guardianService->paginate(
            request()->only(['search']),
        );

        return ApiResponse::success(GuardianResource::collection($guardians));
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', Guardian::class);

        $guardian = $this->guardianService->findById($id);
        if (! $guardian) {
            return ApiResponse::notFound('Guardian not found.');
        }

        return ApiResponse::success(new GuardianResource($guardian));
    }

    public function store(StoreGuardianRequest $request): JsonResponse
    {
        $this->authorize('create', Guardian::class);

        $guardian = $this->guardianService->create($request->validated());

        return ApiResponse::success(new GuardianResource($guardian), 'Guardian created.', 201);
    }

    public function update(UpdateGuardianRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', Guardian::class);

        $guardian = $this->guardianService->update($id, $request->validated());

        return ApiResponse::success(new GuardianResource($guardian));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', Guardian::class);

        $this->guardianService->delete($id);

        return ApiResponse::success(null, 'Guardian deleted successfully.');
    }
}
