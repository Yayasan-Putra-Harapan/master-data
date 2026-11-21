<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'unit_id' => $this->unit_id,
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'is_aktif' => (bool) $this->is_aktif,
            'karyawan_id' => $this->karyawan_id,
            'karyawan' => new KaryawanResource($this->whenLoaded('karyawan')),
            'siswa_id' => $this->siswa_id,
            'siswa' => new SiswaResource($this->whenLoaded('siswa')),
            'orang_tua_id' => $this->orang_tua_id,
            'orang_tua' => new OrangTuaResource($this->whenLoaded('orangTua')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
