<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->unique()->after('name');
            $table->string('role', 50)->default('operator')->change();
            $table->boolean('is_aktif')->default(true)->after('unit_id');
            $table->foreignId('karyawan_id')->nullable()->after('is_aktif')->constrained('karyawan')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('siswa_id')->nullable()->after('karyawan_id')->constrained('siswa')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('orang_tua_id')->nullable()->after('siswa_id')->constrained('orang_tua')->cascadeOnUpdate()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['karyawan_id']);
            $table->dropForeign(['siswa_id']);
            $table->dropForeign(['orang_tua_id']);
            $table->dropColumn(['username', 'is_aktif', 'karyawan_id', 'siswa_id', 'orang_tua_id']);
            $table->enum('role', ['superadmin', 'operator'])->default('superadmin')->change();
        });
    }
};
