<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Http\Response; // Importamos el objeto Response para los códigos HTTP

class UserController extends Controller
{
    /**
     * READ: Obtiene una lista paginada de todos los usuarios.
     * GET /api/users
     */
    public function index()
    {
        // Obtiene 10 usuarios por página
        $users = User::paginate(10); 
        
        // Retorna la colección paginada como JSON
        return response()->json($users, Response::HTTP_OK); // Código 200
    }
    
    /**
     * CREATE: Almacena un nuevo usuario en la base de datos.
     * POST /api/users
     */
    public function store(Request $request)
    {
        // Las validaciones fallidas devuelven automáticamente un JSON 422
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Retorna el nuevo usuario creado y el código de estado 201 (Created)
        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'data' => $user
        ], Response::HTTP_CREATED); // Código 201
    }

    /**
     * READ: Muestra un usuario específico.
     * GET /api/users/{user}
     */
    public function show(User $user)
    {
        // Retorna el modelo de usuario como JSON
        return response()->json($user, Response::HTTP_OK); // Código 200
    }

    /**
     * UPDATE: Actualiza el usuario especificado en la base de datos.
     * PUT/PATCH /api/users/{user}
     */
    public function update(Request $request, User $user)
    {
        // Validaciones: El email debe ser único, EXCEPTO para el usuario actual.
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            // Contraseña opcional: Solo valida si se proporciona.
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        // Si se proporciona una nueva contraseña, la hasheamos y la añadimos.
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        // Retorna el usuario actualizado y el código de estado 200
        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'data' => $user
        ], Response::HTTP_OK); // Código 200
    }

    /**
     * DELETE: Elimina un usuario específico.
     * DELETE /api/users/{user}
     */
    public function destroy(User $user)
    {
        $user->delete();

        // Retorna una respuesta vacía con el código de estado 204 (No Content)
        return response()->json(null, Response::HTTP_NO_CONTENT); // Código 204
    }
}