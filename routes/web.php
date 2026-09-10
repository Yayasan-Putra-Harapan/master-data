<?php

use App\Http\Controllers\ProfileController;
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

    // Siswa Bulk Import & Export
    Route::get('siswa/export', [SiswaController::class, 'export'])->name('siswa.export');
    Route::get('siswa/template', [SiswaController::class, 'template'])->name('siswa.template');
    Route::post('siswa/import', [SiswaController::class, 'import'])->name('siswa.import');
    Route::resource('siswa', SiswaController::class)->except(['create', 'edit', 'show']);

    // Karyawan Bulk Import & Export
    Route::get('karyawan/export', [KaryawanController::class, 'export'])->name('karyawan.export');
    Route::get('karyawan/template', [KaryawanController::class, 'template'])->name('karyawan.template');
    Route::post('karyawan/import', [KaryawanController::class, 'import'])->name('karyawan.import');
    Route::resource('karyawan', KaryawanController::class)->except(['create', 'edit', 'show']);

    // Orang Tua Export
    Route::get('orang-tua/export', [OrangTuaController::class, 'export'])->name('orang-tua.export');
    Route::resource('orang-tua', OrangTuaController::class)->except(['create', 'edit', 'show']);

    // MDM Extension Entities (Increment 2)
    Route::resource('tahun-ajaran', TahunAjaranController::class)->except(['create', 'edit', 'show']);
    Route::resource('kelas', KelasController::class)->except(['create', 'edit', 'show']);
    Route::resource('bangunan', BangunanController::class)->except(['create', 'edit', 'show']);
    Route::resource('ruang', RuangController::class)->except(['create', 'edit', 'show']);
    Route::resource('mata-pelajaran', MataPelajaranController::class)->except(['create', 'edit', 'show']);
    Route::resource('vendor', VendorController::class)->except(['create', 'edit', 'show']);

    // Data Quality Audit (hidden from menu, route retained for research)
    Route::get('/data-quality', [DataQualityAuditController::class, 'index'])->name('data-quality.index');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
