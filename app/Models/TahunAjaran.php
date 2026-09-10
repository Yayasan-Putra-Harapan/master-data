<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TahunAjaran extends Model
{
    /** @use HasFactory<\Database\Factories\TahunAjaranFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'tahun_ajaran';

    protected $fillable = [
        'kode',
        'nama',
        'semester',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_aktif',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'is_aktif' => 'boolean',
    ];

    public function kelas(): HasMany
    {
        return $this->hasMany(Kelas::class, 'tahun_ajaran_id');
    }
}
