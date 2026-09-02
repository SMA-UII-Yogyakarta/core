<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StorageService
{
    protected string $disk;

    public function __construct()
    {
        $this->disk = (string) config('filesystems.default', 'local');
    }

    public function uploadAttendancePhoto(UploadedFile $file, int $studentId): string
    {
        try {
            $image = $this->compress($file);

            $filename = sprintf(
                'attendance/%s/%s_%s.jpg',
                now()->toDateString(),
                $studentId,
                Str::random(8),
            );

            Storage::disk($this->disk)->put($filename, $image, 'public');

            \Illuminate\Support\Facades\Log::info('Attendance photo uploaded successfully', [
                'disk' => $this->disk,
                'student_id' => $studentId,
                'filename' => $filename,
                'size_bytes' => strlen($image),
            ]);

            return Storage::disk($this->disk)->url($filename);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to upload attendance photo', [
                'disk' => $this->disk,
                'student_id' => $studentId,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('Gagal mengunggah foto presensi: ' . $e->getMessage(), 0, $e);
        }
    }

    public function temporaryUrl(string $path, int $expirationMinutes = 60): string
    {
        try {
            return Storage::disk($this->disk)->temporaryUrl(
                $path,
                now()->addMinutes($expirationMinutes),
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Temporary URL generation failed, falling back to standard URL', [
                'disk' => $this->disk,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
            return Storage::disk($this->disk)->url($path);
        }
    }

    public function uploadDocument(UploadedFile $file, string $prefix = 'documents'): string
    {
        try {
            $path = $file->store($prefix . '/' . now()->toDateString(), $this->disk);

            if (! $path) {
                return '';
            }

            \Illuminate\Support\Facades\Log::info('Document uploaded successfully', [
                'disk' => $this->disk,
                'path' => $path,
            ]);

            return Storage::disk($this->disk)->url($path);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to upload document', [
                'disk' => $this->disk,
                'prefix' => $prefix,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('Gagal mengunggah dokumen: ' . $e->getMessage(), 0, $e);
        }
    }

    public function ensureBucketExists(): void
    {
        if ($this->disk === 's3') {
            try {
                $s3Disk = Storage::disk('s3');
                if (method_exists($s3Disk, 'getClient')) {
                    /** @var \Aws\S3\S3Client $client */
                    $client = $s3Disk->getClient();
                    $bucket = (string) config('filesystems.disks.s3.bucket');
                    if (! empty($bucket) && ! $client->doesBucketExist($bucket)) {
                        $client->createBucket(['Bucket' => $bucket]);
                        \Illuminate\Support\Facades\Log::info("Created S3 bucket: {$bucket}");
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('S3 bucket existence check/creation warning: ' . $e->getMessage());
            }
        }
    }

    public function uploadAvatar(UploadedFile $file, int $userId): string
    {
        try {
            $this->ensureBucketExists();
            $image = $this->compress($file);

            $filename = sprintf(
                'avatars/%s/%s_%s.jpg',
                now()->toDateString(),
                $userId,
                Str::random(8),
            );

            Storage::disk($this->disk)->put($filename, $image, 'public');

            if ($this->disk !== 'public') {
                try {
                    Storage::disk('public')->put($filename, $image);
                } catch (\Throwable) {
                }
            }

            \Illuminate\Support\Facades\Log::info('Avatar uploaded successfully', [
                'disk' => $this->disk,
                'user_id' => $userId,
                'filename' => $filename,
            ]);

            return $filename;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to upload avatar', [
                'disk' => $this->disk,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('Gagal mengunggah foto profil: ' . $e->getMessage(), 0, $e);
        }
    }

    public function compress(UploadedFile $file): string
    {
        $realPath = $file->getRealPath() ?: $file->getPathname();

        if (! function_exists('imagecreatefromjpeg') || ! function_exists('imagecreatetruecolor')) {
            $content = @file_get_contents($realPath);

            return $content !== false ? $content : '';
        }

        $maxWidth = 320;
        $maxHeight = 240;
        $quality = 90;
        $maxBytes = 20 * 1024;

        $source = match ($file->getClientOriginalExtension()) {
            'png' => @imagecreatefrompng($file->getRealPath()),
            'gif' => @imagecreatefromgif($file->getRealPath()),
            'webp' => @imagecreatefromwebp($file->getRealPath()),
            default => @imagecreatefromjpeg($file->getRealPath()),
        };

        if (! $source) {
            $source = @imagecreatefromjpeg($file->getRealPath());
        }

        if (! $source) {
            return file_get_contents($file->getRealPath());
        }

        $origWidth = imagesx($source);
        $origHeight = imagesy($source);

        $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight, 1);
        $newWidth = (int) round($origWidth * $ratio);
        $newHeight = (int) round($origHeight * $ratio);

        $canvas = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        ob_start();
        imagejpeg($canvas, null, $quality);
        $data = ob_get_clean() ?: '';

        // Compress further if still > 20KB
        $attempts = 0;
        while (strlen($data) > $maxBytes && $quality > 10 && $attempts < 5) {
            $quality -= 10;
            ob_start();
            imagejpeg($canvas, null, $quality);
            $data = ob_get_clean() ?: '';
            $attempts++;
        }

        imagedestroy($source);
        imagedestroy($canvas);

        return $data;
    }
}
