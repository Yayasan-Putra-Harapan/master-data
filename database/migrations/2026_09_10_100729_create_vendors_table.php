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
        Schema::create('vendor', function (Blueprint $table) {
            $table->id();
            $table->string('kode_vendor', 30)->unique();
            $table->string('nama_vendor', 100);
            $table->enum('kategori', ['sarana_prasarana', 'buku_pelajaran', 'katering', 'seragam', 'teknologi', 'kebersihan', 'lainnya']);
            $table->string('nama_kontak', 100)->nullable();
            $table->string('telepon', 25);
            $table->string('email', 100)->nullable();
            $table->text('alamat')->nullable();
            $table->enum('status', ['aktif', 'non_aktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['kategori', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor');
    }
};
