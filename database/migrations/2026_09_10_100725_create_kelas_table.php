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
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->string('kode_kelas', 30)->unique();
            $table->string('nama_kelas', 100);
            $table->unsignedTinyInteger('tingkat');
            $table->foreignId('unit_id')->constrained('units')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajaran')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('wali_kelas_id')->nullable()->constrained('karyawan')->cascadeOnUpdate()->nullOnDelete();
            $table->unsignedSmallInteger('kapasitas')->default(30);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['unit_id', 'tahun_ajaran_id']);
            $table->index(['unit_id', 'tingkat']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
