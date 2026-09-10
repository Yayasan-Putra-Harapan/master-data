<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TahunAjaranResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'nama' => $this->nama,
            'semester' => $this->semester,
            'tanggal_mulai' => $this->tanggal_mulai?->format('Y-m-d'),
            'tanggal_selesai' => $this->tanggal_selesai?->format('Y-m-d'),
            'is_aktif' => (bool)$this->is_aktif,
            'total_kelas' => $this->whenCounted('kelas'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
