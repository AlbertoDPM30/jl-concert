<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'number',
        'chair_quantity',
        'status',
    ];

    /**
     * Define la relación con las sillas.
     */
    public function chairs()
    {
        // Una mesa tiene muchas sillas
        return $this->hasMany(Chair::class);
    }
}