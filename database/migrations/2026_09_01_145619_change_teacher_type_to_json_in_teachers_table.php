<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // Safe conversion for PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_teacher_type_check');
            DB::statement('ALTER TABLE teachers ALTER COLUMN teacher_type DROP DEFAULT');
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type TYPE json USING (
                CASE
                    WHEN teacher_type = 'homeroom' THEN '[\"homeroom\"]'::json
                    WHEN teacher_type = 'duty' THEN '[\"duty\"]'::json
                    WHEN teacher_type = 'both' THEN '[\"homeroom\",\"duty\"]'::json
                    WHEN teacher_type = 'wali' THEN '[\"homeroom\"]'::json
                    WHEN teacher_type = 'piket' THEN '[\"duty\"]'::json
                    ELSE '[\"duty\"]'::json
                END
            )");
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type SET DEFAULT '[\"duty\"]'::json");
        } else {
            Schema::table('teachers', function (Blueprint $table) {
                $table->dropColumn('teacher_type');
            });
            Schema::table('teachers', function (Blueprint $table) {
                $table->json('teacher_type')->nullable()->default('["duty"]')->after('teacher_code');
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE teachers ALTER COLUMN teacher_type DROP DEFAULT');
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type TYPE varchar(255) USING (
                CASE
                    WHEN teacher_type::text = '[\"homeroom\",\"duty\"]' THEN 'both'
                    WHEN teacher_type::text = '[\"homeroom\"]' THEN 'wali'
                    ELSE 'piket'
                END
            )");
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type SET DEFAULT 'piket'");
        } else {
            Schema::table('teachers', function (Blueprint $table) {
                $table->dropColumn('teacher_type');
            });
            Schema::table('teachers', function (Blueprint $table) {
                $table->enum('teacher_type', ['piket', 'wali', 'both'])->default('piket')->after('teacher_code');
            });
        }
    }
};
