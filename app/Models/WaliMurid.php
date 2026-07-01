<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaliMurid extends Model
{
    use HasFactory;

    protected $table = 'wali_murid';
    protected $primaryKey = 'id_wali_murid';
}
