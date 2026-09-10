<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\AnggotaKelasController;
use App\Http\Controllers\Web\BangunanController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DataQualityAuditController;
use App\Http\Controllers\Web\KaryawanController;
use App\Http\Controllers\Web\KelasController;
use App\Http\Controllers\Web\MataPelajaranController;
use App\Http\Controllers\Web\OrangTuaController;
use App\Http\Controllers\Web\RuangController;
use App\Http\Controllers\Web\SiswaController;
use App\Http\Controllers\Web\TahunAjaranController;
use App\Http\Controllers\Web\UnitController;
use App\Http\Controllers\Web\VendorController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // MDM Core Entities (Increment 1)
    Route::resource('units', UnitController::class)->except(['create', 'edit', 'show']);

    // Siswa Bulk Import, Export & Cetak
    Route::get('siswa/export', [SiswaController::class, 'export'])->name('siswa.export');
    Route::get('siswa/template', [SiswaController::class, 'template'])->name('siswa.template');
    Route::post('siswa/import', [SiswaController::class, 'import'])->name('siswa.import');
    Route::get('siswa/{siswa}/cetak', [SiswaController::class, 'cetak'])->name('siswa.cetak');
    Route::resource('siswa', SiswaController::class)->except(['create', 'edit', 'show']);

    // Karyawan Bulk Import, Export & Cetak
    Route::get('karyawan/export', [KaryawanController::class, 'export'])->name('karyawan.export');
    Route::get('karyawan/template', [KaryawanController::class, 'template'])->name('karyawan.template');
    Route::post('karyawan/import', [KaryawanController::class, 'import'])->name('karyawan.import');
    Route::get('karyawan/{karyawan}/cetak', [KaryawanController::class, 'cetak'])->name('karyawan.cetak');
    Route::resource('karyawan', KaryawanController::class)->except(['create', 'edit', 'show']);

    // Orang Tua Export
    Route::get('orang-tua/export', [OrangTuaController::class, 'export'])->name('orang-tua.export');
    Route::resource('orang-tua', OrangTuaController::class)->except(['create', 'edit', 'show']);

    // MDM Extension Entities (Increment 2)
    Route::resource('tahun-ajaran', TahunAjaranController::class)->except(['create', 'edit', 'show']);

    // Rombel Siswa Management
    Route::get('kelas/export', [KelasController::class, 'export'])->name('kelas.export');
    Route::get('kelas/template', [KelasController::class, 'template'])->name('kelas.template');
    Route::post('kelas/import', [KelasController::class, 'import'])->name('kelas.import');
    Route::get('kelas/{kelas}/cetak', [KelasController::class, 'cetak'])->name('kelas.cetak');
    Route::get('kelas/{kelas}/anggota', [AnggotaKelasController::class, 'index'])->name('kelas.anggota.index');
    Route::get('kelas/{kelas}/available-siswa', [AnggotaKelasController::class, 'availableSiswa'])->name('kelas.anggota.available');
    Route::post('kelas/{kelas}/anggota', [AnggotaKelasController::class, 'store'])->name('kelas.anggota.store');
    Route::delete('kelas/{kelas}/anggota/{siswa}', [AnggotaKelasController::class, 'destroy'])->name('kelas.anggota.destroy');
    Route::post('kelas/{kelas}/transfer', [AnggotaKelasController::class, 'transfer'])->name('kelas.anggota.transfer');
    Route::resource('kelas', KelasController::class)->except(['create', 'edit', 'show']);

    // Bangunan Bulk Import & Export
    Route::get('bangunan/export', [BangunanController::class, 'export'])->name('bangunan.export');
    Route::get('bangunan/template', [BangunanController::class, 'template'])->name('bangunan.template');
    Route::post('bangunan/import', [BangunanController::class, 'import'])->name('bangunan.import');
    Route::resource('bangunan', BangunanController::class)->except(['create', 'edit', 'show']);

    // Ruang Bulk Import & Export
    Route::get('ruang/export', [RuangController::class, 'export'])->name('ruang.export');
    Route::get('ruang/template', [RuangController::class, 'template'])->name('ruang.template');
    Route::post('ruang/import', [RuangController::class, 'import'])->name('ruang.import');
    Route::resource('ruang', RuangController::class)->except(['create', 'edit', 'show']);

    // Mata Pelajaran Bulk Import & Export
    Route::get('mata-pelajaran/export', [MataPelajaranController::class, 'export'])->name('mata-pelajaran.export');
    Route::get('mata-pelajaran/template', [MataPelajaranController::class, 'template'])->name('mata-pelajaran.template');
    Route::post('mata-pelajaran/import', [MataPelajaranController::class, 'import'])->name('mata-pelajaran.import');
    Route::resource('mata-pelajaran', MataPelajaranController::class)->except(['create', 'edit', 'show']);

    // Vendor Bulk Import & Export
    Route::get('vendor/export', [VendorController::class, 'export'])->name('vendor.export');
    Route::get('vendor/template', [VendorController::class, 'template'])->name('vendor.template');
    Route::post('vendor/import', [VendorController::class, 'import'])->name('vendor.import');
    Route::resource('vendor', VendorController::class)->except(['create', 'edit', 'show']);

    // Data Quality Audit (hidden from menu, route retained for research)
    Route::get('/data-quality', [DataQualityAuditController::class, 'index'])->name('data-quality.index');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
