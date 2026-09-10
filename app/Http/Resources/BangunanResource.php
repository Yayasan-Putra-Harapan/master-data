<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BangunanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_bangunan' => $this->kode_bangunan,
            'nama_bangunan' => $this->nama_bangunan,
            'unit_id' => $this->unit_id,
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'jumlah_lantai' => $this->jumlah_lantai,
            'luas' => $this->luas,
            'kondisi' => $this->kondisi,
            'keterangan' => $this->keterangan,
            'total_ruang' => $this->whenCounted('ruang'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
