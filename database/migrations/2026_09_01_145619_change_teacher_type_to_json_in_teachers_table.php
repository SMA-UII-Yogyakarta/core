<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Safe conversion for PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_teacher_type_check");
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type DROP DEFAULT");
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type TYPE json USING (
                CASE 
                    WHEN teacher_type = 'duty' THEN '[\"piket\"]'::json
                    WHEN teacher_type = 'homeroom' THEN '[\"wali\"]'::json
                    WHEN teacher_type = 'both' THEN '[\"piket\",\"wali\"]'::json
                    ELSE '[\"piket\"]'::json
                END
            )");
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type SET DEFAULT '[\"piket\"]'::json");
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
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type DROP DEFAULT");
            DB::statement("ALTER TABLE teachers ALTER COLUMN teacher_type TYPE varchar(255) USING (
                CASE 
                    WHEN teacher_type::text = '[\"piket\",\"wali\"]' THEN 'both'
                    WHEN teacher_type::text = '[\"wali\"]' THEN 'wali'
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
