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
        Schema::create('orang_tua', function (Blueprint $table) {
            $table->id();
            $table->string('no_kk', 16)->nullable()->index();
            $table->string('nik_ayah', 16)->nullable()->index();
            $table->string('nama_ayah', 100)->nullable();
            $table->string('pekerjaan_ayah', 100)->nullable();
            $table->string('penghasilan_ayah', 50)->nullable();
            $table->string('nik_ibu', 16)->nullable()->index();
            $table->string('nama_ibu', 100)->nullable();
            $table->string('pekerjaan_ibu', 100)->nullable();
            $table->string('penghasilan_ibu', 50)->nullable();
            $table->string('nama_wali', 100)->nullable();
            $table->string('nik_wali', 16)->nullable();
            $table->string('hubungan_wali', 50)->nullable();
            $table->string('telepon', 25);
            $table->string('email', 100)->nullable();
            $table->text('alamat');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orang_tua');
    }
};
