<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RuangResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_ruang' => $this->kode_ruang,
            'nama_ruang' => $this->nama_ruang,
            'bangunan_id' => $this->bangunan_id,
            'bangunan' => new BangunanResource($this->whenLoaded('bangunan')),
            'lantai' => $this->lantai,
            'fungsi' => $this->fungsi,
            'kapasitas' => $this->kapasitas,
            'kondisi' => $this->kondisi,
            'keterangan' => $this->keterangan,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
