<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MataPelajaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_mapel' => $this->kode_mapel,
            'nama_mapel' => $this->nama_mapel,
            'unit_id' => $this->unit_id,
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'kelompok' => $this->kelompok,
            'beban_jam' => $this->beban_jam,
            'keterangan' => $this->keterangan,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
