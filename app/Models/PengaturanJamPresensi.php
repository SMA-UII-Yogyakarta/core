<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengaturanJamPresensi extends Model
{
    use HasFactory;

    protected $table = 'pengaturan_jam_presensi';
    protected $primaryKey = 'id_pengaturan';
}
