<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Http\JsonResponse;

class StudentController extends Controller
{
    public function __construct(
        protected StudentService $studentService,
    ) {
    }

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        $students = $this->studentService->paginate(
            request()->only(['search', 'class_id', 'status']),
        );

        return ApiResponse::success(StudentResource::collection($students));
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', Student::class);

        $student = $this->studentService->findById($id);
        if (! $student) {
            return ApiResponse::notFound('Student not found.');
        }

        return ApiResponse::success(new StudentResource($student));
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $this->authorize('create', Student::class);

        $student = $this->studentService->create($request->validated());

        return ApiResponse::success(new StudentResource($student), 'Student created.', 201);
    }

    public function update(UpdateStudentRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', Student::class);

        $student = $this->studentService->update($id, $request->validated());

        return ApiResponse::success(new StudentResource($student));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', Student::class);

        $this->studentService->delete($id);

        return ApiResponse::success(null, 'Student deleted successfully.');
    }
}
