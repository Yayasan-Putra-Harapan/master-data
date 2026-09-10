<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiswaResource extends JsonResource
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
            'nisn' => $this->nisn,
            'nis' => $this->nis,
            'nik' => $this->nik,
            'nama_lengkap' => $this->nama_lengkap,
            'nama_panggilan' => $this->nama_panggilan,
            'jenis_kelamin' => $this->jenis_kelamin,
            'tempat_lahir' => $this->tempat_lahir,
            'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
            'agama' => $this->agama,
            'unit_id' => $this->unit_id,
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'orang_tua_id' => $this->orang_tua_id,
            'orang_tua' => new OrangTuaResource($this->whenLoaded('orangTua')),
            'alamat' => $this->alamat,
            'angkatan' => $this->angkatan,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
