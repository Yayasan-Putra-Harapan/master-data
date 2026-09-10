<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrangTuaResource extends JsonResource
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
            'no_kk' => $this->no_kk,
            'nik_ayah' => $this->nik_ayah,
            'nama_ayah' => $this->nama_ayah,
            'pekerjaan_ayah' => $this->pekerjaan_ayah,
            'penghasilan_ayah' => $this->penghasilan_ayah,
            'nik_ibu' => $this->nik_ibu,
            'nama_ibu' => $this->nama_ibu,
            'pekerjaan_ibu' => $this->pekerjaan_ibu,
            'penghasilan_ibu' => $this->penghasilan_ibu,
            'nama_wali' => $this->nama_wali,
            'nik_wali' => $this->nik_wali,
            'hubungan_wali' => $this->hubungan_wali,
            'telepon' => $this->telepon,
            'email' => $this->email,
            'alamat' => $this->alamat,
            'total_siswa' => $this->whenCounted('siswa'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
