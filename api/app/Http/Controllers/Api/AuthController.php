<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    /**
     * Registro de un nuevo usuario.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Requiere 'password_confirmation'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Opcional: Iniciar sesión inmediatamente después del registro
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], Response::HTTP_CREATED); // Código 201
    }

    /**
     * Autenticación de un usuario existente (Login).
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Intentar autenticar al usuario
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Si falla, lanzar una excepción de validación
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Buscar al usuario (ya está autenticado, solo lo recuperamos)
        $user = User::where('email', $request->email)->firstOrFail();

        // Crear un token de API para el usuario
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], Response::HTTP_OK); // Código 200
    }

    /**
     * Cerrar sesión (Logout).
     */
    public function logout(Request $request)
    {
        // Revocar el token que se usó para la autenticación actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ], Response::HTTP_OK); // Código 200
    }

    /**
     * Opcional: Obtener el usuario autenticado.
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}