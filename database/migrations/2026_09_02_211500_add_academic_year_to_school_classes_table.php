<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('school_classes', function (Blueprint $table) {
            $table->string('academic_year', 20)->default('2024/2025')->after('level');
            $table->unique(['name', 'academic_year'], 'school_classes_name_academic_year_unique');
        });
    }

    public function down(): void
    {
        Schema::table('school_classes', function (Blueprint $table) {
            $table->dropUnique('school_classes_name_academic_year_unique');
            $table->dropColumn('academic_year');
        });
    }
};
