<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

/**
 * ApiResponse — Format standar respons JSON untuk seluruh API.
 *
 * Digunakan di semua controller API untuk memastikan format respons
 * konsisten. Persiapan untuk pemisahan frontend (Next.js) di masa depan.
 *
 * @see docs/error-handling-patterns.md — §2.5 API Error Response Format
 */
class ApiResponse
{
    /**
     * Success response.
     */
    public static function success(mixed $data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'errors' => null,
            'data' => $data,
        ], $code);
    }

    /**
     * Error response.
     */
    public static function error(string $message = 'Error', int $code = 400, mixed $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'data' => null,
        ], $code);
    }

    /**
     * 404 Not Found.
     */
    public static function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return self::error($message, 404);
    }

    /**
     * 422 Validation Error.
     */
    public static function validationError(mixed $errors): JsonResponse
    {
        return self::error('Validation failed', 422, $errors);
    }

    /**
     * 403 Forbidden.
     */
    public static function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return self::error($message, 403);
    }

    /**
     * 500 Internal Server Error.
     */
    public static function serverError(string $message = 'Internal server error'): JsonResponse
    {
        return self::error($message, 500);
    }
}
