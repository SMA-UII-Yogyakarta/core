<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
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

        return response()->json($this->teacherService->paginate(
            request()->only(['search']),
        ));
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', Teacher::class);

        $teacher = $this->teacherService->findById($id);
        if (! $teacher) {
            return response()->json(['message' => 'Teacher not found.'], 404);
        }
        return response()->json($teacher);
    }

    public function store(StoreTeacherRequest $request): JsonResponse
    {
        $this->authorize('create', Teacher::class);

        return response()->json($this->teacherService->create($request->validated()), 201);
    }

    public function update(UpdateTeacherRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', Teacher::class);

        return response()->json($this->teacherService->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', Teacher::class);

        $this->teacherService->delete($id);
        return response()->json(['message' => 'Teacher deleted successfully.']);
    }
}
