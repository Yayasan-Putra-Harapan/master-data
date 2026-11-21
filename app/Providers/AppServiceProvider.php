<?php

namespace App\Providers;

use App\Models\Karyawan;
use App\Models\OrangTua;
use App\Models\Siswa;
use App\Models\User;
use App\Observers\KaryawanObserver;
use App\Observers\OrangTuaObserver;
use App\Observers\SiswaObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Route::resourceParameters([
            'kelas' => 'kelas',
        ]);

        Gate::define('viewApiDocs', function (?User $user) {
            return $user !== null;
        });

        Siswa::observe(SiswaObserver::class);
        Karyawan::observe(KaryawanObserver::class);
        OrangTua::observe(OrangTuaObserver::class);
    }
}
