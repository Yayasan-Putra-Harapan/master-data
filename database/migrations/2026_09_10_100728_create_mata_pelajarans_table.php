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
        Schema::create('mata_pelajaran', function (Blueprint $table) {
            $table->id();
            $table->string('kode_mapel', 30)->unique();
            $table->string('nama_mapel', 100);
            $table->foreignId('unit_id')->constrained('units')->cascadeOnUpdate()->restrictOnDelete();
            $table->enum('kelompok', ['wajib', 'peminatan', 'muatan_lokal', 'ekstrakurikuler'])->default('wajib');
            $table->unsignedTinyInteger('beban_jam')->default(2);
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['unit_id', 'kelompok']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mata_pelajaran');
    }
};
