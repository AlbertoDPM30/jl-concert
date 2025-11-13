<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class AssignedChair extends Model
{

    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'id_client',
        'id_chair',
        'id_table',
    ];

}
