<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignedChair extends Model
{

    use HasFactory;
    
    protected $fillable = [
        'id_client',
        'id_chair',
        'id_table',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client', 'id');
    }

    public function chair()
    {
        return $this->belongsTo(Chair::class, 'id_chair', 'id');
    }

    public function table()
    {
        return $this->belongsTo(Table::class, 'id_table', 'id');
    }
}
