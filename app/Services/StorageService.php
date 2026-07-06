<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StorageService
{
    protected string $disk;

    public function __construct()
    {
        $this->disk = env('FILESYSTEM_DISK', 'local');
    }

    public function uploadAttendancePhoto(UploadedFile $file, int $studentId): string
    {
        $image = $this->compress($file);

        $filename = sprintf(
            'attendance/%s/%s_%s.jpg',
            now()->toDateString(),
            $studentId,
            Str::random(8),
        );

        Storage::disk($this->disk)->put($filename, $image, 'public');

        return Storage::disk($this->disk)->url($filename);
    }

    public function compress(UploadedFile $file): string
    {
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
        $data = ob_get_clean();

        imagedestroy($source);
        imagedestroy($canvas);

        // Compress further if still > 20KB
        $attempts = 0;
        while (strlen($data) > $maxBytes && $quality > 10 && $attempts < 5) {
            $quality -= 10;
            ob_start();
            $canvasResized = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($canvasResized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
            imagejpeg($canvasResized, null, $quality);
            $data = ob_get_clean();
            imagedestroy($canvasResized);
            $attempts++;
        }

        return $data;
    }
}
