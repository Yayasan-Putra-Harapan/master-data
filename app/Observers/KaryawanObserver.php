<?php

namespace App\Observers;

use App\Models\Karyawan;
use App\Services\UserProvisioningService;

class KaryawanObserver
{
    public function __construct(protected UserProvisioningService $provisioningService) {}

    public function saved(Karyawan $karyawan): void
    {
        $this->provisioningService->syncKaryawanUser($karyawan);
    }

    public function deleted(Karyawan $karyawan): void
    {
        $this->provisioningService->deleteKaryawanUser($karyawan);
    }
}
