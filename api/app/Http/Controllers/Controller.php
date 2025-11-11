<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function ping()
    {
        return response()->json(['status' => 'OK', 'mensaje' => 'API funcionando correctamente']);
    }

    public function pruebaConexion()
    {
        try {
            \DB::connection()->getPdo();
            return response()->json(['estado' => 'Conectado a la base de datos']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
