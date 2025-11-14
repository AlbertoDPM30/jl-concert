"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// 1. Crear el Contexto
const AuthContext = createContext();

// Dirección de la API desde la variable de entorno
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Cargar el token al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      // Opcional: Decodificar el token o hacer una solicitud para obtener datos del usuario
      // Para este ejemplo, solo cargaremos el token.
    }
    setLoading(false);
  }, []);

  // 3. Función de Login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/login/`, {
        // Asegúrate que esta es la ruta correcta
        email,
        password,
      });

      const accessToken = response.data.token; // Asumiendo que el backend devuelve { token: '...' }

      // Almacenar el token
      localStorage.setItem("authToken", accessToken);
      setToken(accessToken);

      // Opcional: Obtener datos del usuario loggeado
      // await fetchUser(accessToken);

      return true; // Login exitoso
    } catch (error) {
      console.error(
        "Error de login:",
        error.response ? error.response.data : error.message
      );
      throw new Error(
        error.response?.data?.detail || "Fallo el inicio de sesión"
      );
    }
  };

  // 4. Función de Logout
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  // 5. Interceptor de Axios para enviar el token en cada solicitud
  // Esto asegura que cada solicitud enviada por axios incluya el token si existe.
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Limpieza al desmontar o al cambiar el token
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  const contextValue = {
    token,
    user,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  if (loading) return <div>Cargando autenticación...</div>; // O un componente de Spinner

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// 6. Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
