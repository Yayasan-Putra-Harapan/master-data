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
        Schema::create('bangunan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_bangunan', 30)->unique();
            $table->string('nama_bangunan', 100);
            $table->foreignId('unit_id')->constrained('units')->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedTinyInteger('jumlah_lantai')->default(1);
            $table->decimal('luas', 10, 2)->nullable();
            $table->enum('kondisi', ['baik', 'rusak_ringan', 'rusak_berat'])->default('baik');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['unit_id', 'kondisi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bangunan');
    }
};
