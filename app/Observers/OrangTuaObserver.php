<?php

namespace App\Observers;

use App\Models\OrangTua;
use App\Services\UserProvisioningService;

class OrangTuaObserver
{
    public function __construct(protected UserProvisioningService $provisioningService) {}

    public function saved(OrangTua $orangTua): void
    {
        $this->provisioningService->syncOrangTuaUser($orangTua);
    }

    public function deleted(OrangTua $orangTua): void
    {
        $this->provisioningService->deleteOrangTuaUser($orangTua);
    }
}
