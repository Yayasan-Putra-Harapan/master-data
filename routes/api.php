<?php

use App\Http\Controllers\Api\V1\DataQualityApiController;
use App\Http\Controllers\Api\V1\KaryawanApiController;
use App\Http\Controllers\Api\V1\OrangTuaApiController;
use App\Http\Controllers\Api\V1\SiswaApiController;
use App\Http\Controllers\Api\V1\UnitApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::apiResource('units', UnitApiController::class);
    Route::apiResource('orang-tua', OrangTuaApiController::class);
    Route::apiResource('karyawan', KaryawanApiController::class);
    Route::apiResource('siswa', SiswaApiController::class);

    Route::get('data-quality', [DataQualityApiController::class, 'index'])->name('data-quality');
});
