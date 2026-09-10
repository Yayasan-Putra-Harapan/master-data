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
        Schema::create('anggota_kelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajaran')->cascadeOnUpdate()->restrictOnDelete();
            $table->date('tanggal_masuk')->default(now());
            $table->enum('status', ['aktif', 'pindah', 'keluar'])->default('aktif');
            $table->string('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['siswa_id', 'kelas_id', 'tahun_ajaran_id']);
            $table->index(['kelas_id', 'tahun_ajaran_id', 'status']);
            $table->index(['siswa_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anggota_kelas');
    }
};
