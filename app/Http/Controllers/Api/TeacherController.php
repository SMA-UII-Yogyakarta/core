<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherRequest;
use App\Http\Requests\UpdateTeacherRequest;
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
        return response()->json($this->teacherService->paginate(
            request()->only(['search']),
        ));
    }

    public function show(int $id): JsonResponse
    {
        $teacher = $this->teacherService->findById($id);
        if (! $teacher) {
            return response()->json(['message' => 'Guru tidak ditemukan.'], 404);
        }
        return response()->json($teacher);
    }

    public function store(StoreTeacherRequest $request): JsonResponse
    {
        return response()->json($this->teacherService->create($request->validated()), 201);
    }

    public function update(UpdateTeacherRequest $request, int $id): JsonResponse
    {
        return response()->json($this->teacherService->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->teacherService->delete($id);
        return response()->json(['message' => 'Guru berhasil dihapus.']);
    }
}
