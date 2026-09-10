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
        Schema::create('ruang', function (Blueprint $table) {
            $table->id();
            $table->string('kode_ruang', 30)->unique();
            $table->string('nama_ruang', 100);
            $table->foreignId('bangunan_id')->constrained('bangunan')->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedTinyInteger('lantai')->default(1);
            $table->enum('fungsi', ['kelas', 'laboratorium', 'perpustakaan', 'kantor', 'aula', 'ibadah', 'lainnya']);
            $table->unsignedSmallInteger('kapasitas')->default(30);
            $table->enum('kondisi', ['baik', 'rusak_ringan', 'rusak_berat'])->default('baik');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['bangunan_id', 'fungsi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ruang');
    }
};
