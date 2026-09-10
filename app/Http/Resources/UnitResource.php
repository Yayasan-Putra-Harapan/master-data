<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitResource extends JsonResource
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
            'kode_unit' => $this->kode_unit,
            'nama_unit' => $this->nama_unit,
            'jenjang' => $this->jenjang,
            'alamat' => $this->alamat,
            'telepon' => $this->telepon,
            'email' => $this->email,
            'kepala_sekolah' => $this->kepala_sekolah,
            'is_aktif' => (bool)$this->is_aktif,
            'total_siswa' => $this->whenCounted('siswa'),
            'total_karyawan' => $this->whenCounted('karyawan'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
