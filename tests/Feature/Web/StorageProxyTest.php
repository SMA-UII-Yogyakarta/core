<?php

namespace Tests\Feature\Web;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StorageProxyTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('s3');
        config(['filesystems.default' => 's3']);
    }

    public function test_can_access_s3_file_via_storage_proxy_route(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');
        $path = Storage::disk('s3')->putFile('documents', $file);

        $response = $this->get('/storage-s3/' . $path);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('max-age=31536000', (string) $response->headers->get('Cache-Control'));
    }

    public function test_returns_404_when_proxying_non_existent_file(): void
    {
        $response = $this->get('/storage-s3/non-existent-file.jpg');

        $response->assertStatus(404);
    }
}
