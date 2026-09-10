<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    /** @use HasFactory<\Database\Factories\VendorFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'vendor';

    protected $fillable = [
        'kode_vendor',
        'nama_vendor',
        'kategori',
        'nama_kontak',
        'telepon',
        'email',
        'alamat',
        'status',
    ];
}
