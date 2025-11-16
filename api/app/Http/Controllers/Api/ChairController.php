<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Chair;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChairController extends Controller
{
    /**
     * Muestra una lista de todas las sillas.
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            // Se puede agregar paginación si es necesario, pero por defecto se traen todas.
            $chairs = Chair::with('table')->get();
            return response()->json($chairs);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo recuperar la lista de sillas.', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Almacena un nuevo recurso (silla) en la base de datos.
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Reglas de validación
        $validator = Validator::make($request->all(), [
            'id_table' => 'required|exists:tables,id', // Debe existir la mesa
            'number' => 'required|integer|min:1', // Número de silla, debe ser positivo
            'status' => 'nullable|boolean', // Estado (true/false)
            // Se puede agregar una regla para asegurar que 'number' sea único dentro de 'id_table'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $chair = Chair::create([
                'id_table' => $request->id_table,
                'number' => $request->number,
                // Si el estado no se proporciona, se asume 'true' (habilitada) o el valor por defecto del modelo.
                'status' => $request->input('status', true), 
            ]);

            return response()->json($chair, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo crear la silla.', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Muestra el recurso (silla) especificado.
     * @param  \App\Models\Chair  $chair
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Chair $chair)
    {
        try {
            // Cargar la relación 'table' para dar contexto
            $chair->load('table'); 
            return response()->json($chair);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Silla no encontrada.', 'message' => $e->getMessage()], 404);
        }
    }

    /**
     * Obtiene todas las sillas asociadas a una mesa específica.
     * Este es el nuevo endpoint que has solicitado.
     * @param  int  $tableId
     * @return \Illuminate\Http\JsonResponse
     */
    public function chairsByTable(int $tableId)
    {
        try {
            $chairs = Chair::where('id_table', $tableId)
                           ->orderBy('number') // Opcional: ordenar por número de silla para mejor presentación
                           ->get();
            
            // Si no se encuentra la mesa o no tiene sillas, se devuelve un array vacío (200 OK)
            return response()->json($chairs);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al recuperar las sillas para la mesa.', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualiza el recurso (silla) especificado en la base de datos.
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Chair  $chair
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Chair $chair)
    {
        // Reglas de validación para la actualización
        $validator = Validator::make($request->all(), [
            'id_table' => 'sometimes|required|exists:tables,id',
            'number' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Solo se actualizan los campos validados
            $chair->update($request->only(['id_table', 'number', 'status']));
            
            // Retornar el recurso actualizado
            return response()->json($chair);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo actualizar la silla.', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Elimina el recurso (silla) especificado de la base de datos.
     * @param  \App\Models\Chair  $chair
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Chair $chair)
    {
        try {
            $chair->delete();
            // Código 204: No Content, para indicar que la acción fue exitosa pero no hay contenido para retornar.
            return response()->json(null, 204); 
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo eliminar la silla.', 'message' => $e->getMessage()], 500);
        }
    }
}