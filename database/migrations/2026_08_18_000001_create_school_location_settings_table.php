<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('school_location_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('SMA UII Yogyakarta');
            $table->text('address')->default('Jl. Taman Siswa No.158, Wirogunan, Kec. Mergangsan, Kota Yogyakarta, D.I. Yogyakarta 55151');
            $table->decimal('latitude', 10, 7)->default(-7.814257);
            $table->decimal('longitude', 10, 7)->default(110.375944);
            $table->integer('radius_meters')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_location_settings');
    }
};
