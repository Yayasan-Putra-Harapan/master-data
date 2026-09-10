<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kelas extends Model
{
    /** @use HasFactory<\Database\Factories\KelasFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'kelas';

    protected $fillable = [
        'kode_kelas',
        'nama_kelas',
        'tingkat',
        'unit_id',
        'tahun_ajaran_id',
        'wali_kelas_id',
        'kapasitas',
    ];

    protected $casts = [
        'tingkat' => 'integer',
        'kapasitas' => 'integer',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    public function waliKelas(): BelongsTo
    {
        return $this->belongsTo(Karyawan::class, 'wali_kelas_id');
    }

    public function anggotaKelas(): HasMany
    {
        return $this->hasMany(AnggotaKelas::class, 'kelas_id');
    }

    public function siswa(): BelongsToMany
    {
        return $this->belongsToMany(Siswa::class, 'anggota_kelas', 'kelas_id', 'siswa_id')
            ->withPivot(['tahun_ajaran_id', 'status', 'tanggal_masuk', 'keterangan'])
            ->withTimestamps();
    }
}
