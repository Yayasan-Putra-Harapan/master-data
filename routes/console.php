<?php

use App\Services\UserProvisioningService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('users:sync-master', function (UserProvisioningService $service) {
    $this->info('Memulai sinkronisasi otomatis entitas master ke tabel users...');
    $counts = $service->syncAllExisting();
    $this->info("Sinkronisasi selesai:");
    $this->line("- Karyawan/Guru : {$counts['karyawan']} akun");
    $this->line("- Siswa         : {$counts['siswa']} akun");
    $this->line("- Orang Tua     : {$counts['orang_tua']} akun");
})->purpose('Sinkronisasi akun user untuk seluruh data Karyawan, Siswa, dan Orang Tua');
