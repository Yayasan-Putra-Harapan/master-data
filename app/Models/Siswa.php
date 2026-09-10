<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Siswa extends Model
{
    /** @use HasFactory<\Database\Factories\SiswaFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'siswa';

    protected $fillable = [
        'nisn',
        'nis',
        'nik',
        'nama_lengkap',
        'nama_panggilan',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'agama',
        'unit_id',
        'orang_tua_id',
        'alamat',
        'angkatan',
        'status',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'angkatan' => 'integer',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function orangTua(): BelongsTo
    {
        return $this->belongsTo(OrangTua::class, 'orang_tua_id');
    }

    public function anggotaKelas(): HasMany
    {
        return $this->hasMany(AnggotaKelas::class, 'siswa_id');
    }

    public function riwayatKelas(): BelongsToMany
    {
        return $this->belongsToMany(Kelas::class, 'anggota_kelas', 'siswa_id', 'kelas_id')
            ->withPivot(['tahun_ajaran_id', 'status', 'tanggal_masuk', 'keterangan'])
            ->withTimestamps();
    }
}
