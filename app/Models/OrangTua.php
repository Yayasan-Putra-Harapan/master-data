<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrangTua extends Model
{
    /** @use HasFactory<\Database\Factories\OrangTuaFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'orang_tua';

    protected $fillable = [
        'no_kk',
        'nik_ayah',
        'nama_ayah',
        'pekerjaan_ayah',
        'penghasilan_ayah',
        'nik_ibu',
        'nama_ibu',
        'pekerjaan_ibu',
        'penghasilan_ibu',
        'nama_wali',
        'nik_wali',
        'hubungan_wali',
        'telepon',
        'email',
        'alamat',
    ];

    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class, 'orang_tua_id');
    }
}
