"use client";

import { useState, useEffect } from "react";
import useApi from "./useApi";

/**
 * Hook personalizado para manejar operaciones CRUD de clients
 */
export default function useClients() {
  const { data, loading, error, get, post, put, remove } = useApi();
  const [clients, setClients] = useState([]);

  // Cargar clients al montar el componente
  useEffect(() => {
    if (data) {
      setClients(Array.isArray(data) ? data : []);
    }
  }, [data]);

  // Obtener todos los clients
  const fetchClients = async () => {
    await get("clients");
  };

  // Crear un nuevo client
  const createClient = async (clientData) => {
    const result = await post("clients", clientData);
    if (!result.error) {
      await fetchClients(); // Recargar la lista
    }
    return result;
  };

  // Actualizar un client existente
  const updateClient = async (id, clientData) => {
    const result = await put(`clients/${id}`, clientData);
    if (!result.error) {
      await fetchClients(); // Recargar la lista
    }
    return result;
  };

  // Eliminar un client
  const deleteClient = async (id) => {
    const result = await remove(`clients/${id}`);
    if (!result.error) {
      await fetchClients(); // Recargar la lista
    }
    return result;
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}
