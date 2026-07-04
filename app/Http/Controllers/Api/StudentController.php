<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
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
        $students = $this->studentService->paginate(
            request()->only(['search', 'class_id', 'status']),
        );

        return response()->json($students);
    }

    public function show(int $id): JsonResponse
    {
        $student = $this->studentService->findById($id);
        if (! $student) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        return response()->json($student);
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = $this->studentService->create($request->validated());
        return response()->json($student, 201);
    }

    public function update(UpdateStudentRequest $request, int $id): JsonResponse
    {
        $student = $this->studentService->update($id, $request->validated());
        return response()->json($student);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->studentService->delete($id);
        return response()->json(['message' => 'Siswa berhasil dihapus.']);
    }
}
