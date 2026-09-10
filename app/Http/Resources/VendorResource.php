<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_vendor' => $this->kode_vendor,
            'nama_vendor' => $this->nama_vendor,
            'kategori' => $this->kategori,
            'nama_kontak' => $this->nama_kontak,
            'telepon' => $this->telepon,
            'email' => $this->email,
            'alamat' => $this->alamat,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
