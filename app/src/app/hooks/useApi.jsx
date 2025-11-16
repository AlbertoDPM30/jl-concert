"use client";

import { useState } from "react";
// 1. Importar el hook useAuth para acceder al token
import { useAuth } from "../../../context/AuthContext"; // Asume que AuthContext.jsx está en '../auth/AuthContext.jsx'

/**
 * Hook personalizado para manejar llamadas a la API REST.
 *
 * @returns {object} { data, loading, error, get, post, put, remove }
 */
export default function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el token del contexto de autenticación
  const { token } = useAuth();

  // Obtiene la URL base de las variables de entorno
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api";

  /**
   * Función central para ejecutar la solicitud HTTP.
   * @param {string} endpoint - La ruta específica de la API
   * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
   * @param {object} body - Datos para enviar en el cuerpo de la solicitud (POST/PUT)
   * @returns {Promise<object>} - El resultado de la respuesta JSON
   */
  const executeRequest = async (endpoint, method = "GET", body = null) => {
    setLoading(true);
    setError(null);
    let result = null;

    try {
      const url = `${API_BASE_URL}/${endpoint}`;

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };

      // 2. Adjuntar el token si existe
      if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
      }

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      // Manejar respuestas sin contenido (como DELETE 204)
      if (response.status === 204) {
        setData(null);
        setLoading(false);
        return { message: "Operación exitosa (Sin Contenido)", data: null };
      }

      // Manejar el caso de Unauthorized (401)
      if (response.status === 401) {
        throw new Error("Acceso no autorizado. Por favor, inicia sesión.");
      }

      // Intentar parsear el JSON. Si falla, lanzar error.
      const jsonResponse = await response.json();

      if (!response.ok) {
        // Manejar errores de la API (4xx, 5xx)
        const errorMessage =
          jsonResponse.message ||
          `Error ${response.status}: La solicitud falló.`;
        throw new Error(errorMessage);
      }

      // Éxito
      setData(jsonResponse.data || jsonResponse);
      result = jsonResponse;
    } catch (err) {
      console.error("API Error:", err.message);
      setError(err.message);
      setData(null);
      // Lanzar el error para que el componente que llama lo maneje si es necesario
      result = { error: err.message };
    } finally {
      setLoading(false);
    }

    return result;
  };

  // Métodos wrapper específicos:

  const get = (endpoint) => executeRequest(endpoint, "GET");
  const getBy = (endpoint) => executeRequest(endpoint, "GET");
  const post = (endpoint, body) => executeRequest(endpoint, "POST", body);
  const put = (endpoint, body) => executeRequest(endpoint, "PUT", body);
  const remove = (endpoint) => executeRequest(endpoint, "DELETE");

  return {
    data,
    loading,
    error,
    get,
    getBy,
    post,
    put,
    remove,
    setData, // Útil para actualizar el estado de los datos manualmente
  };
}
