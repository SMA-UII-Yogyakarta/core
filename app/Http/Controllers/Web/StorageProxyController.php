<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StorageProxyController extends Controller
{
    public function show(string $path): StreamedResponse
    {
        $diskName = (string) config('filesystems.default', 's3');
        $disk = Storage::disk($diskName);

        try {
            if (! $disk->exists($path)) {
                abort(404, 'File not found');
            }

            $mimeType = $disk->mimeType($path) ?: 'image/jpeg';
            $size = $disk->size($path);
            $stream = $disk->readStream($path);
        } catch (\Throwable) {
            abort(404, 'File not found');
        }

        return response()->stream(function () use ($stream) {
            if (is_resource($stream)) {
                fpassthru($stream);
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $mimeType,
            'Content-Length' => (string) $size,
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
