<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuardianRequest;
use App\Http\Requests\UpdateGuardianRequest;
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
        return response()->json($this->guardianService->paginate(
            request()->only(['search']),
        ));
    }

    public function show(int $id): JsonResponse
    {
        $guardian = $this->guardianService->findById($id);
        if (! $guardian) {
            return response()->json(['message' => 'Wali murid tidak ditemukan.'], 404);
        }
        return response()->json($guardian);
    }

    public function store(StoreGuardianRequest $request): JsonResponse
    {
        return response()->json($this->guardianService->create($request->validated()), 201);
    }

    public function update(UpdateGuardianRequest $request, int $id): JsonResponse
    {
        return response()->json($this->guardianService->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->guardianService->delete($id);
        return response()->json(['message' => 'Wali murid berhasil dihapus.']);
    }
}
