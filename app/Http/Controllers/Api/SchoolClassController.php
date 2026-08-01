<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            return response()->json($this->schoolClassService->findAll());
        }

        return response()->json($this->schoolClassService->paginate(
            request()->only(['search']),
        ));
    }

    public function show(int $id): JsonResponse
    {
        $this->authorize('view', SchoolClass::class);

        $class = $this->schoolClassService->findById($id);
        if (! $class) {
            return response()->json(['message' => 'Class not found.'], 404);
        }
        return response()->json($class);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', SchoolClass::class);

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
        ]);

        return response()->json($this->schoolClassService->create($validated), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorize('update', SchoolClass::class);

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'teacher_id' => 'nullable|exists:teachers,id',
            'capacity' => 'nullable|integer|min:1',
        ]);

        return response()->json($this->schoolClassService->update($id, $validated));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', SchoolClass::class);

        $this->schoolClassService->delete($id);
        return response()->json(['message' => 'Class deleted successfully.']);
    }
}
