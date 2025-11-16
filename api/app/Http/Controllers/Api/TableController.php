<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\Chair;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Response;

class TableController extends Controller
{
    /**
     * READ: Obtiene todos los mesas.
     * GET /api/tables
     */
    public function index()
    {
        // 1. Obtiene TODOS los mesas sin paginación.
        $tables = Table::all(); 
        
        // Retorna la colección como JSON
        return response()->json($tables, Response::HTTP_OK); // Código 200
    }
    
    /**
     * CREATE: Almacena una nueva Mesa y crea N registros en chairs.
     * POST /api/tables
     */
    public function store(Request $request)
    {
        // Las validaciones fallidas devuelven automáticamente un JSON 422
        $request->validate([
            'chair_quantity' => 'required|integer|min:1|max:11',
            'status' => 'required|boolean',
        ]);

        // Obtener el número de mesa más alto.
        $lastTableNumber = Table::max('number');
        $newTableNumber = $lastTableNumber ? $lastTableNumber + 1 : 1;
        
        // Crear el registro en Tables
        $table = Table::create([
            'number' => $newTableNumber, // Usamos el número calculado
            'chair_quantity' => $request->chair_quantity,
            'status' => $request->status,
        ]);

        // Crear los registros relacionados en la tabla 'chairs'
        $chairsToInsert = [];
        $quantity = $request->chair_quantity;

        for ($i = 1; $i <= $quantity; $i++) {
            $chairsToInsert[] = [
                'id_table' => $table->id, // Usamos el ID de la mesa recién insertada
                'chair_number' => $i, 
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Inserción masiva para eficiencia
        if (!empty($chairsToInsert)) {
            Chair::insert($chairsToInsert);
        }

        // Retorna la nueva Tablee creada y el código de estado 201 (Created)
        return response()->json([
            'message' => "Mesa {$newTableNumber} creada exitosamente con {$quantity} sillas asociadas.",
            'data' => $table->load('chairs')
        ], Response::HTTP_CREATED); // Código 201
    }

    /**
     * READ: Muestra un Tablee específico.
     * GET /api/tables/{Table}
     */
    public function show(Table $table)
    {
        // Retorna el modelo de Tablee con sus sillas relacionadas como JSON
        return response()->json($table->load('chairs'), Response::HTTP_OK); // Código 200
    }

    /**
     * UPDATE: Actualiza el Tablee especificado en la base de datos.
     * PUT/PATCH /api/tables/{Table}
     */
    public function update(Request $request, Table $table)
    {
        $request->validate([
            'chair_quantity' => 'required|integer|max:11',
            'status' => 'required|boolean',
        ]);

        $tableData = [
            'chair_quantity' => $request->chair_quantity,
            'status' => $request->status,
        ];

        $table->update($tableData);

        // Retorna la mesa actualizada y el código de estado 200
        return response()->json([
            'message' => 'Mesa actualizada exitosamente',
            'data' => $table
        ], Response::HTTP_OK); // Código 200
    }

    /**
     * DELETE: Elimina una mesa específica y sus sillas relacionadas.
     * DELETE /api/tables/{Table}
     */
    public function destroy(Table $table)
    {
        // Eliminar los registros relacionados en 'chairs'
        $table->chairs()->delete();
        
        // Eliminar el registro principal
        $table->delete();

        // Retorna una respuesta vacía con el código de estado 204 (No Content)
        return response()->json([
            'message' => 'Mesa y todas sus sillas relacionadas eliminadas exitosamente'
        ], Response::HTTP_NO_CONTENT); // Código 204
    }
}