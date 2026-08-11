<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\SchoolClassResource;
use App\Models\SchoolClass;
use App\Services\SchoolClassService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function __construct(
        protected SchoolClassService $schoolClassService,
    ) {
    }

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', SchoolClass::class);

        if (request()->has('all') && request()->boolean('all')) {
            return ApiResponse::success(SchoolClassResource::collection(
                $this->schoolClassService->findAll(),
            ));
        }

        return ApiResponse::success(SchoolClassResource::collection(
            $this->schoolClassService->paginate(request()->only(['search'])),
        ));
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', SchoolClass::class);

        $class = $this->schoolClassService->findById($id);
        if (! $class) {
            return ApiResponse::notFound('Class not found.');
        }

        return ApiResponse::success(new SchoolClassResource($class));
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', SchoolClass::class);

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
        ]);

        return ApiResponse::success(
            new SchoolClassResource($this->schoolClassService->create($validated)),
            'Class created.',
            201,
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorize('update', SchoolClass::class);

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
        ]);

        return ApiResponse::success(new SchoolClassResource(
            $this->schoolClassService->update($id, $validated),
        ));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', SchoolClass::class);

        $this->schoolClassService->delete($id);

        return ApiResponse::success(null, 'Class deleted successfully.');
    }
}
