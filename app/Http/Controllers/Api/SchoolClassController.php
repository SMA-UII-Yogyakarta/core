<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
        if (request()->has('all') && request()->boolean('all')) {
            return response()->json($this->schoolClassService->findAll());
        }

        return response()->json($this->schoolClassService->paginate(
            request()->only(['search']),
        ));
    }

    public function show(int $id): JsonResponse
    {
        $class = $this->schoolClassService->findById($id);
        if (! $class) {
            return response()->json(['message' => 'Kelas tidak ditemukan.'], 404);
        }
        return response()->json($class);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
        ]);

        return response()->json($this->schoolClassService->create($validated), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
        ]);

        return response()->json($this->schoolClassService->update($id, $validated));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->schoolClassService->delete($id);
        return response()->json(['message' => 'Kelas berhasil dihapus.']);
    }
}
