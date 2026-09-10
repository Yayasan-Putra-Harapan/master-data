<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MataPelajaran extends Model
{
    /** @use HasFactory<\Database\Factories\MataPelajaranFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'mata_pelajaran';

    protected $fillable = [
        'kode_mapel',
        'nama_mapel',
        'unit_id',
        'kelompok',
        'beban_jam',
        'keterangan',
    ];

    protected $casts = [
        'beban_jam' => 'integer',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
