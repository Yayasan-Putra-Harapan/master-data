<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Unit extends Model
{
    /** @use HasFactory<\Database\Factories\UnitFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'units';

    protected $fillable = [
        'kode_unit',
        'nama_unit',
        'jenjang',
        'alamat',
        'telepon',
        'email',
        'kepala_sekolah',
        'is_aktif',
    ];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    public function karyawan(): HasMany
    {
        return $this->hasMany(Karyawan::class, 'unit_id');
    }

    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class, 'unit_id');
    }
}
