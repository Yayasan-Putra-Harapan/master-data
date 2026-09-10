<?php

use App\Http\Controllers\Api\V1\BangunanApiController;
use App\Http\Controllers\Api\V1\DataQualityApiController;
use App\Http\Controllers\Api\V1\KaryawanApiController;
use App\Http\Controllers\Api\V1\KelasApiController;
use App\Http\Controllers\Api\V1\MataPelajaranApiController;
use App\Http\Controllers\Api\V1\OrangTuaApiController;
use App\Http\Controllers\Api\V1\RuangApiController;
use App\Http\Controllers\Api\V1\SiswaApiController;
use App\Http\Controllers\Api\V1\TahunAjaranApiController;
use App\Http\Controllers\Api\V1\UnitApiController;
use App\Http\Controllers\Api\V1\VendorApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    // Increment 1
    Route::apiResource('units', UnitApiController::class);
    Route::apiResource('orang-tua', OrangTuaApiController::class);
    Route::apiResource('karyawan', KaryawanApiController::class);
    Route::apiResource('siswa', SiswaApiController::class);

    // Increment 2
    Route::apiResource('tahun-ajaran', TahunAjaranApiController::class);
    Route::apiResource('kelas', KelasApiController::class);
    Route::apiResource('bangunan', BangunanApiController::class);
    Route::apiResource('ruang', RuangApiController::class);
    Route::apiResource('mata-pelajaran', MataPelajaranApiController::class);
    Route::apiResource('vendor', VendorApiController::class);

    Route::get('data-quality', [DataQualityApiController::class, 'index'])->name('data-quality');
});
