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
        Schema::create('karyawan', function (Blueprint $table) {
            $table->id();
            $table->string('nip', 30)->nullable()->unique();
            $table->string('nuptk', 16)->nullable()->unique();
            $table->string('nik', 16)->unique();
            $table->string('nama', 100);
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir', 100)->nullable();
            $table->date('tanggal_lahir');
            $table->foreignId('unit_id')->constrained('units')->cascadeOnUpdate()->restrictOnDelete();
            $table->enum('role', ['guru', 'staf', 'kepala_sekolah', 'keuangan', 'administrasi']);
            $table->enum('status_kepegawaian', ['tetap', 'kontrak', 'honorer'])->default('tetap');
            $table->string('telepon', 25);
            $table->string('email', 100)->unique();
            $table->text('alamat')->nullable();
            $table->string('pendidikan_terakhir', 50)->nullable();
            $table->date('tanggal_masuk');
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['unit_id', 'role']);
            $table->index(['unit_id', 'is_aktif']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('karyawan');
    }
};
