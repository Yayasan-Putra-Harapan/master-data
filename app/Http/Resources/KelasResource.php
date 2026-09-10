<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KelasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_kelas' => $this->kode_kelas,
            'nama_kelas' => $this->nama_kelas,
            'tingkat' => $this->tingkat,
            'unit_id' => $this->unit_id,
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'tahun_ajaran_id' => $this->tahun_ajaran_id,
            'tahun_ajaran' => new TahunAjaranResource($this->whenLoaded('tahunAjaran')),
            'wali_kelas_id' => $this->wali_kelas_id,
            'wali_kelas' => new KaryawanResource($this->whenLoaded('waliKelas')),
            'kapasitas' => $this->kapasitas,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
