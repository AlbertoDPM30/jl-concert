<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\ChairController;
use App\Http\Controllers\Api\AssignedChairController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
// Route::middleware('cors')->group(function () {
// --- Rutas Públicas (Autenticación) ---
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/', [AuthController::class, 'ping']);
    Route::get('/test', [AuthController::class, 'pruebaConexion']);

    // --- Rutas Protegidas (Requieren Token) ---
    Route::middleware('auth:sanctum')->group(function () {
        
        // Ruta para cerrar sesión
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Ruta para obtener datos del usuario    
        Route::apiResource('users', UserController::class);
        
        // Ruta para obtener datos del cliente    
        Route::apiResource('clients', ClientController::class);
        
        // Ruta para obtener datos de las mesas    
        Route::apiResource('tables', TableController::class);
        
        // Ruta para obtener datos de las sillas   
        Route::apiResource('chairs', ChairController::class);
        Route::get('tables/{tableId}/chairs', [ChairController::class, 'chairsByTable']);
        
        // Ruta para obtener datos del cliente    
        Route::apiResource('assigned', AssignedChairController::class);
        Route::get('tables/{tableId}/assigned', [AssignedChairController::class, 'tableByAssigned']);
        Route::get('chairs/{chairId}/assigned', [AssignedChairController::class, 'chairByAssigned']);

    });
// });