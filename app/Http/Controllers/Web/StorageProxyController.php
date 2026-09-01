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
    private const ATTENDANCE_PHOTO_PATTERN = '#^attendance/(?P<date>\d{4}-\d{2}-\d{2})/(?P<studentId>\d+)_(?P<random>[A-Za-z0-9_-]{4,})\.(jpg|jpeg|png|webp)$#i';

    private const DOCUMENT_PATTERN = '#^(documents|leaves)/(?P<date>\d{4}-\d{2}-\d{2})/[A-Za-z0-9_-]+\.[A-Za-z0-9]{2,5}$#i';

    private const AVATAR_PATTERN = '#^(avatars|profiles)/(\d{4}-\d{2}-\d{2}/)?[A-Za-z0-9_-]+\.[A-Za-z0-9]{2,5}$#i';

    public function __construct(
        protected GuardianService $guardianService,
        protected StudentService $studentService,
    ) {
    }

    public function show(Request $request, string $path): StreamedResponse
    {
        $this->authorizePath($request->user(), $path);

        $diskName = (string) config('filesystems.default', 'local');
        $disk = Storage::disk($diskName);

        // Fallback disk checks for S3 / RustFS / local / public compatibility
        if (! $disk->exists($path)) {
            if ($diskName !== 's3' && Storage::disk('s3')->exists($path)) {
                $disk = Storage::disk('s3');
            } elseif ($diskName !== 'public' && Storage::disk('public')->exists($path)) {
                $disk = Storage::disk('public');
            } elseif ($diskName !== 'local' && Storage::disk('local')->exists($path)) {
                $disk = Storage::disk('local');
            } else {
                abort(404, 'File not found');
            }
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

        // Avatars and public documents are viewable by all authenticated users
        if (preg_match(self::AVATAR_PATTERN, $path) === 1 || preg_match(self::DOCUMENT_PATTERN, $path) === 1) {
            return;
        }

        if (preg_match(self::ATTENDANCE_PHOTO_PATTERN, $path, $matches) !== 1) {
            // Allow general demo or asset files
            if (str_starts_with($path, 'demo/') || str_starts_with($path, 'public/')) {
                return;
            }
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
