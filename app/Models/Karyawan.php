<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Karyawan extends Model
{
    /** @use HasFactory<\Database\Factories\KaryawanFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'karyawan';

    protected $fillable = [
        'nip',
        'nuptk',
        'nik',
        'nama',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'unit_id',
        'role',
        'status_kepegawaian',
        'telepon',
        'email',
        'alamat',
        'pendidikan_terakhir',
        'tanggal_masuk',
        'is_aktif',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_masuk' => 'date',
        'is_aktif' => 'boolean',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
