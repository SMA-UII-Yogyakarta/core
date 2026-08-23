<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\GuardianService;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StorageProxyController extends Controller
{
    private const ATTENDANCE_PHOTO_PATTERN = '#^attendance/(?P<date>\d{4}-\d{2}-\d{2})/(?P<studentId>\d+)_(?P<random>[A-Za-z0-9]{8})\.jpg$#';

    private const DOCUMENT_PATTERN = '#^documents/\d{4}-\d{2}-\d{2}/[A-Za-z0-9]{16,}\.[A-Za-z0-9]{2,5}$#';

    public function __construct(
        protected GuardianService $guardianService,
        protected StudentService $studentService,
    ) {
    }

    public function show(Request $request, string $path): StreamedResponse
    {
        $this->authorizePath($request->user(), $path);

        $diskName = (string) config('filesystems.default', 's3');
        $disk = Storage::disk($diskName);

        if (! $disk->exists($path)) {
            abort(404, 'File not found');
        }

        $mimeType = $disk->mimeType($path) ?: 'image/jpeg';
        $size = $disk->size($path);
        $stream = $disk->readStream($path);

        return response()->stream(function () use ($stream) {
            if (is_resource($stream)) {
                fpassthru($stream);
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $mimeType,
            'Content-Length' => (string) $size,
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    private function authorizePath($user, string $path): void
    {
        if ($user === null) {
            abort(401, 'Unauthenticated.');
        }

        if (preg_match(self::DOCUMENT_PATTERN, $path) === 1) {
            return;
        }

        if (preg_match(self::ATTENDANCE_PHOTO_PATTERN, $path, $matches) !== 1) {
            abort(404, 'File not found');
        }

        $ownerStudentId = (int) $matches['studentId'];
        $role = (string) $user->role;

        if ($role === 'admin' || $role === 'teacher') {
            return;
        }

        if ($role === 'guardian') {
            $guardian = $this->guardianService->findByUserId($user->id);

            $isOwner = $guardian !== null && Student::query()
                ->where('guardian_id', $guardian->id)
                ->whereKey($ownerStudentId)
                ->exists();

            if (! $isOwner) {
                abort(403, 'Forbidden');
            }

            return;
        }

        if ($role === 'student') {
            $student = $this->studentService->findByUserId($user->id);

            if ($student === null || $student->id !== $ownerStudentId) {
                abort(403, 'Forbidden');
            }

            return;
        }

        abort(403, 'Forbidden');
    }
}
