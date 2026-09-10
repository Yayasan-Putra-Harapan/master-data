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
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('kode_unit', 20)->unique();
            $table->string('nama_unit', 100);
            $table->enum('jenjang', ['PG', 'TK', 'SD', 'SMP', 'SMA', 'BOARDING']);
            $table->text('alamat')->nullable();
            $table->string('telepon', 25)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('kepala_sekolah', 100)->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['jenjang', 'is_aktif']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
