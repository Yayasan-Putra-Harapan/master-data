<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KaryawanResource extends JsonResource
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
            'nip' => $this->nip,
            'nuptk' => $this->nuptk,
            'nik' => $this->nik,
            'nama' => $this->nama,
            'jenis_kelamin' => $this->jenis_kelamin,
            'tempat_lahir' => $this->tempat_lahir,
            'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
            'unit_id' => $this->unit_id,
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'role' => $this->role,
            'status_kepegawaian' => $this->status_kepegawaian,
            'telepon' => $this->telepon,
            'email' => $this->email,
            'alamat' => $this->alamat,
            'pendidikan_terakhir' => $this->pendidikan_terakhir,
            'tanggal_masuk' => $this->tanggal_masuk?->format('Y-m-d'),
            'is_aktif' => (bool)$this->is_aktif,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
