<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use App\Services\TeacherService;
use Illuminate\Http\JsonResponse;

class TeacherController extends Controller
{
    public function __construct(
        protected TeacherService $teacherService,
    ) {
    }

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Teacher::class);

        $teachers = $this->teacherService->paginate(
            request()->only(['search']),
        );

        return ApiResponse::success(TeacherResource::collection($teachers));
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', Teacher::class);

        $teacher = $this->teacherService->findById($id);
        if (! $teacher) {
            return ApiResponse::notFound('Teacher not found.');
        }

        return ApiResponse::success(new TeacherResource($teacher));
    }

    public function store(StoreTeacherRequest $request): JsonResponse
    {
        $this->authorize('create', Teacher::class);

        $teacher = $this->teacherService->create($request->validated());

        return ApiResponse::success(new TeacherResource($teacher), 'Teacher created.', 201);
    }

    public function update(UpdateTeacherRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', Teacher::class);

        $teacher = $this->teacherService->update($id, $request->validated());

        return ApiResponse::success(new TeacherResource($teacher));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', Teacher::class);

        $this->teacherService->delete($id);

        return ApiResponse::success(null, 'Teacher deleted successfully.');
    }
}
