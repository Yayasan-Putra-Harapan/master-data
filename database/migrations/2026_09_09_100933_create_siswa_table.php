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
        Schema::create('siswa', function (Blueprint $table) {
            $table->id();
            $table->string('nisn', 10)->unique();
            $table->string('nis', 20)->nullable()->unique();
            $table->string('nik', 16)->nullable()->unique();
            $table->string('nama_lengkap', 150);
            $table->string('nama_panggilan', 50)->nullable();
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir', 100);
            $table->date('tanggal_lahir');
            $table->string('agama', 30)->default('Islam');
            $table->foreignId('unit_id')->constrained('units')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('orang_tua_id')->nullable()->constrained('orang_tua')->cascadeOnUpdate()->nullOnDelete();
            $table->text('alamat');
            $table->unsignedSmallInteger('angkatan');
            $table->enum('status', ['aktif', 'lulus', 'mutasi', 'keluar'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['unit_id', 'status']);
            $table->index(['unit_id', 'angkatan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswa');
    }
};
