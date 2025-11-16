<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssignedChair;
use App\Models\Table; // Necesario para actualizar el status de la mesa
use App\Models\Chair; // Necesario para actualizar el status de la silla
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Necesario para las transacciones
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Response;

class AssignedChairController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Muestra todas las asignaciones, cargando las relaciones si existen
        return AssignedChair::with(['client', 'table', 'chair'])->get();
    }

    /**
     * Store a newly created resource in storage.
     * Se asigna la silla y la mesa, y se cambia su status a 1 (Ocupado/Asignado).
     * * Requiere: id_client, id_chair, id_table
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_client' => 'required|exists:clients,id',
            'id_chair' => 'required|exists:chairs,id',
            'id_table' => 'required|exists:tables,id',
        ]);

        try {
            // Usamos transacciones para asegurar la atomicidad: si falla la actualización
            // de status, el registro de asignación no se crea.
            return DB::transaction(function () use ($request) {
                // 1. Crear el registro AssignedChair
                $assignedChair = AssignedChair::create($request->all());

                // 2. Obtener IDs
                $tableId = $assignedChair->id_table;
                $chairId = $assignedChair->id_chair;

                // 3. Actualizar el status de la Table a 1 (Asignado/Ocupado)
                Table::where('id', $tableId)->update(['status' => 1]);

                // 4. Actualizar el status de la Chair a 1 (Asignado/Ocupado)
                Chair::where('id', $chairId)->update(['status' => 1]);

                return response()->json([
                    'message' => 'Chair assigned successfully and status updated.',
                    'data' => $assignedChair
                ], 201);
            });

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to process assignment.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AssignedChair $assignedChair)
    {
        return $assignedChair->load(['client', 'table', 'chair']);
    }

    /**
     * Obtiene todas las mesas asociadas a una asignacion específica.
     * Este es el nuevo endpoint que has solicitado.
     * @param  int  $tableId
     * @return \Illuminate\Http\JsonResponse
     */
    public function tableByAssigned(int $tableId)
    {
        try {
            $assignedChair = AssignedChair::where('id_table', $tableId)
                ->with(['client', 'chair', 'table']) // Incluir relaciones con client, chair y table
                ->orderBy('id_chair')
                ->get();
            
            // Si no se encuentra la mesa asignada, se devuelve un array vacío (200 OK)
            return response()->json($assignedChair);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al recuperar las Mesas asignadas.', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtiene todas las sillas asociadas a una mesa específica.
     * Este es el nuevo endpoint que has solicitado.
     * @param  int  $chairId
     * @return \Illuminate\Http\JsonResponse
     */
    public function chairByAssigned(int $chairId)
    {
        try {
            $assignedChair = AssignedChair::where('id_chair', $chairId)
                ->with(['client', 'chair', 'table']) // Incluir relaciones con client, chair y table
                ->orderBy('id_chair')
                ->get();
            
            // Si no se encuentra la mesa asignada, se devuelve un array vacío (200 OK)
            return response()->json($assignedChair);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al recuperar las sillas para la mesa.', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     * (Lógica no modificada, pero lista para ser implementada)
     */
    public function update(Request $request, AssignedChair $assignedChair)
    {
        // Si se actualizan los IDs, deberías gestionar la liberación de los recursos antiguos
        // y la asignación de los nuevos, actualizando los status de 0 a 1 y viceversa.
        return response()->json(['message' => 'Update logic to be implemented.']);
    }

    /**
     * Remove the specified resource from storage.
     * Se libera la silla y la mesa (si no hay más sillas ocupadas), y se cambia su status a 0 (Libre/Disponible).
     */
    // public function destroy(AssignedChair $assignedChair)
    // {
    //     // 1. Guardar los IDs antes de eliminar el registro de asignación
    //     $tableId = $assignedChair->id_table;
    //     $chairId = $assignedChair->id_chair;
        
    //     try {
    //         return DB::transaction(function () use ($assignedChair, $tableId, $chairId) {
                
    //             // 2. Eliminar el registro AssignedChair
    //             $assignedChair->delete();

    //             // 3. Verificar si hay otras asignaciones en la misma mesa
    //             $otherAssignmentsInTable = AssignedChair::where('id_table', $tableId)->count();
                
    //             // 4. Actualizar el status de la Table a 0 (Libre/Disponible) solo si no hay más asignaciones
    //             if ($otherAssignmentsInTable === 0) {
    //                 Table::where('id', $tableId)->update(['status' => 0]);
    //             }

    //             // 5. Actualizar el status de la Chair a 0 (Libre/Disponible)
    //             Chair::where('id', $chairId)->update(['status' => 0]);

    //             return response()->json(['message' => 'Silla asignada eliminada y status actualizados.'], 200);
    //         });

    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Fallo al eliminar una silla asignada.', 'details' => $e->getMessage()], 500);
    //     }
    // }


    public function destroy($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                // Buscar directamente por ID
                $assignedChair = DB::table('assigned_chairs')->where('id', $id)->first();
                
                if (!$assignedChair) {
                    return response()->json(['error' => 'Asignación no encontrada'], 404);
                }
                
                $tableId = $assignedChair->id_table;
                $chairId = $assignedChair->id_chair;
                
                // Eliminar el registro
                DB::table('assigned_chairs')->where('id', $id)->delete();
                
                $otherAssignments = DB::table('assigned_chairs')->where('id_table', $tableId)->count();
                
                if ($otherAssignments === 0) {
                    DB::table('tables')->where('id', $tableId)->update(['status' => 0]);
                }
                
                DB::table('chairs')->where('id', $chairId)->update(['status' => 0]);
                
                return response()->json([
                    'message' => 'Eliminado correctamente',
                    'debug' => [
                        'id_table' => $tableId,
                        'id_chair' => $chairId,
                        'remaining_assignments' => $otherAssignments
                    ]
                ], 200);
            });
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en el servidor',
                'exception' => $e->getMessage()
            ], 500);
        }
    }
}