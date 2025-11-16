<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chair extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_table',
        'number',
        'status',
    ];

    /**
     * Define la relación inversa con la mesa.
     */
    public function table()
    {
        // Una silla pertenece a una mesa
        return $this->belongsTo(Table::class);
    }
}