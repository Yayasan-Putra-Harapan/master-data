<?php

namespace App\Observers;

use App\Models\Siswa;
use App\Services\UserProvisioningService;

class SiswaObserver
{
    public function __construct(protected UserProvisioningService $provisioningService) {}

    public function saved(Siswa $siswa): void
    {
        $this->provisioningService->syncSiswaUser($siswa);
    }

    public function deleted(Siswa $siswa): void
    {
        $this->provisioningService->deleteSiswaUser($siswa);
    }
}
