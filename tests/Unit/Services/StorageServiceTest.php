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

    public function test_upload_attendance_photo_stores_file_and_returns_url(): void
    {
        $file = UploadedFile::fake()->create('attendance.jpg', 640, 'image/jpeg');
        $url = $this->storageService->uploadAttendancePhoto($file, 123);

        $this->assertNotEmpty($url);
        Storage::disk('s3')->assertExists(
            'attendance/' . now()->toDateString() . '/',
        );
    }
}
