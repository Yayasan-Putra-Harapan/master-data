<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DataQualityAuditController;
use App\Http\Controllers\Web\KaryawanController;
use App\Http\Controllers\Web\OrangTuaController;
use App\Http\Controllers\Web\SiswaController;
use App\Http\Controllers\Web\UnitController;
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
    Route::resource('orang-tua', OrangTuaController::class)->except(['create', 'edit', 'show']);
    Route::resource('karyawan', KaryawanController::class)->except(['create', 'edit', 'show']);
    Route::resource('siswa', SiswaController::class)->except(['create', 'edit', 'show']);

    // Data Quality Audit
    Route::get('/data-quality', [DataQualityAuditController::class, 'index'])->name('data-quality.index');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
