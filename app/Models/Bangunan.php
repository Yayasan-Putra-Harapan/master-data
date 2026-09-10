<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bangunan extends Model
{
    /** @use HasFactory<\Database\Factories\BangunanFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'bangunan';

    protected $fillable = [
        'kode_bangunan',
        'nama_bangunan',
        'unit_id',
        'jumlah_lantai',
        'luas',
        'kondisi',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_lantai' => 'integer',
        'luas' => 'float',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function ruang(): HasMany
    {
        return $this->hasMany(Ruang::class, 'bangunan_id');
    }
}
