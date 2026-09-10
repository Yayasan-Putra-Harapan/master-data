<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ruang extends Model
{
    /** @use HasFactory<\Database\Factories\RuangFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'ruang';

    protected $fillable = [
        'kode_ruang',
        'nama_ruang',
        'bangunan_id',
        'lantai',
        'fungsi',
        'kapasitas',
        'kondisi',
        'keterangan',
    ];

    protected $casts = [
        'lantai' => 'integer',
        'kapasitas' => 'integer',
    ];

    public function bangunan(): BelongsTo
    {
        return $this->belongsTo(Bangunan::class, 'bangunan_id');
    }
}
