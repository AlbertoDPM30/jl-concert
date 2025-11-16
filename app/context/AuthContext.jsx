"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Crear el Contexto
const AuthContext = createContext();

// Dirección de la API desde la variable de entorno
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener los datos del usuario
  const fetchUser = async (userToken) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/users/`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      // Asumiendo que el backend devuelve los datos del usuario en response.data
      const userData = response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error(
        "Error al obtener datos del usuario:",
        error.response ? error.response.data : error.message
      );
      // Si hay error al obtener el usuario, limpiamos el token
      localStorage.removeItem("authToken");
      setToken(null);
      throw new Error("No se pudieron obtener los datos del usuario");
    }
  };

  // Cargar el token y datos del usuario al iniciar
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
        try {
          // Obtener datos del usuario con el token almacenado
          await fetchUser(storedToken);
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
          // Si hay error, limpiamos el token inválido
          localStorage.removeItem("authToken");
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Función de Login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/login/`, {
        email,
        password,
      });

      const accessToken = response.data.access_token;

      // Almacenar el token
      localStorage.setItem("authToken", accessToken);
      setToken(accessToken);

      // Obtener y almacenar datos del usuario
      const userData = await fetchUser(accessToken);

      return { success: true, user: userData };
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

  // Función de Logout
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  // Función para actualizar datos del usuario
  const updateUser = (newUserData) => {
    setUser((prevUser) => ({ ...prevUser, ...newUserData }));
  };

  // Interceptor de Axios para enviar el token en cada solicitud
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
    updateUser,
    fetchUser: () => fetchUser(token), // Permitir refetch manual
  };

  if (loading) return <div>Cargando autenticación...</div>;

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
