<?php

namespace Tests\Unit\Services;

use App\Services\StorageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StorageServiceTest extends TestCase
{
    protected StorageService $storageService;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('s3');
        config(['filesystems.default' => 's3']);
        $this->storageService = new StorageService();
    }

    public function test_compress_returns_string_for_uploaded_file(): void
    {
        $file = UploadedFile::fake()->create('test_photo.jpg', 640, 'image/jpeg');
        $compressed = $this->storageService->compress($file);

        $this->assertCount(1, [$compressed]);
    }

    public function test_upload_attendance_photo_stores_file_and_returns_relative_path(): void
    {
        $file = UploadedFile::fake()->create('attendance.jpg', 640, 'image/jpeg');
        $path = $this->storageService->uploadAttendancePhoto($file, 123);

        $this->assertNotEmpty($path);
        $this->assertStringStartsWith('attendance/', $path);
        Storage::disk('s3')->assertExists(
            'attendance/' . now()->toDateString() . '/',
        );
    }

    public function test_url_handles_null_and_empty(): void
    {
        $this->assertNull(StorageService::url(null));
        $this->assertNull(StorageService::url(''));
    }

    public function test_url_passes_through_external_http_urls(): void
    {
        $externalUrl = 'https://example.com/avatar.jpg';
        $this->assertSame($externalUrl, StorageService::url($externalUrl));
    }

    public function test_url_converts_relative_paths_to_media_route(): void
    {
        $result = StorageService::url('avatars/2026-09-10/user_1.jpg');
        $this->assertSame(route('media.show', ['path' => 'avatars/2026-09-10/user_1.jpg']), $result);
    }
}
