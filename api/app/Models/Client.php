<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Client extends Model
{

    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'fullname',
        'ci',
        'phone_number',
    ];

    /**
     * Define la relación con las sillas.
     */
    public function assigned()
    {
        // Un cliente tiene muchas sillas
        return $this->hasMany(AssignedChair::class);
    }
}
