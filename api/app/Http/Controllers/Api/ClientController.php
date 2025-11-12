<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Http\Response;

class ClientController extends Controller
{
    /**
     * READ: Obtiene una lista paginada de todos los clientes.
     * GET /api/clients
     */
    public function index()
    {
        
        // Obtiene 10 clientes por página
        $clients = Client::paginate(10); 
        
        // Retorna la colección paginada como JSON
        return response()->json($clients, Response::HTTP_OK); // Código 200
    }
    
    /**
     * CREATE: Almacena un nuevo Cliente en la base de datos.
     * POST /api/clients
     */
    public function store(Request $request)
    {
        // Las validaciones fallidas devuelven automáticamente un JSON 422
        $request->validate([
            'fullname' => 'required|string|max:255',
            'ci' => 'required|string|min:6|max:20|unique:clients',
            'phone_number' => 'required|string|min:10|max:12|',
        ]);

        $client = Client::create([
            'fullname' => $request->fullname,
            'ci' => $request->ci,
            'phone_number' => $request->phone_number,
        ]);

        // Retorna el nuevo Cliente creado y el código de estado 201 (Created)
        return response()->json([
            'message' => 'Cliente creado exitosamente',
            'data' => $client
        ], Response::HTTP_CREATED); // Código 201
    }

    /**
     * READ: Muestra un Cliente específico.
     * GET /api/clients/{client}
     */
    public function show(Client $client)
    {
        // Retorna el modelo de Cliente como JSON
        return response()->json($client, Response::HTTP_OK); // Código 200
    }

    /**
     * UPDATE: Actualiza el Cliente especificado en la base de datos.
     * PUT/PATCH /api/clients/{client}
     */
    public function update(Request $request, Client $client)
    {
        // Validaciones: El email debe ser único, EXCEPTO para el Cliente actual.
        $request->validate([
            'fullname' => 'required|string|max:255',
            'ci' => [
                'required',
                'string',
                'min:6',
                'max:20',
                Rule::unique('clients')->ignore($client->id),
            ],
            // Contraseña opcional: Solo valida si se proporciona.
            'phone_number' => 'required|string|min:10|max:12',
        ]);

        $ClientData = [
            'fullname' => $request->fullname,
            'ci' => $request->ci,
            'phone_number' => $request->phone_number,
        ];

        // Si se proporciona una nueva contraseña, la hasheamos y la añadimos.
        if ($request->filled('password')) {
            $ClientData['password'] = Hash::make($request->password);
        }

        $client->update($ClientData);

        // Retorna el Cliente actualizado y el código de estado 200
        return response()->json([
            'message' => 'Cliente actualizado exitosamente',
            'data' => $client
        ], Response::HTTP_OK); // Código 200
    }

    /**
     * DELETE: Elimina un Cliente específico.
     * DELETE /api/clients/{client}
     */
    public function destroy(Client $client)
    {
        $client->delete();

        // Retorna una respuesta vacía con el código de estado 204 (No Content)
        return response()->json([
            'message' => 'Cliente Eliminado exitosamente'
        ], Response::HTTP_NO_CONTENT); // Código 204
    }
}
