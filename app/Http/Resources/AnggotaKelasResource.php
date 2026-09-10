<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnggotaKelasResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'siswa_id' => $this->siswa_id,
            'siswa' => new SiswaResource($this->whenLoaded('siswa')),
            'kelas_id' => $this->kelas_id,
            'kelas' => new KelasResource($this->whenLoaded('kelas')),
            'tahun_ajaran_id' => $this->tahun_ajaran_id,
            'tahun_ajaran' => new TahunAjaranResource($this->whenLoaded('tahunAjaran')),
            'tanggal_masuk' => $this->tanggal_masuk?->format('Y-m-d'),
            'status' => $this->status,
            'keterangan' => $this->keterangan,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
