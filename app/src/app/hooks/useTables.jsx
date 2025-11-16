"use client";

import { useState, useEffect } from "react";
import useApi from "./useApi";

/**
 * Hook personalizado para manejar operaciones CRUD de tables
 */
export default function useTables() {
  const { data, loading, error, get, post, put, remove } = useApi();
  const [tables, setTables] = useState([]);

  // Cargar mesas al montar el componente
  useEffect(() => {
    if (data) {
      setTables(Array.isArray(data) ? data : []);
    }
  }, [data]);

  // Obtener todos los mesas
  const fetchTables = async () => {
    await get("tables");
  };

  // Crear una nueva mesa
  const createTable = async (TableData) => {
    const result = await post("tables", TableData);
    if (!result.error) {
      await fetchTables(); // Recargar la lista
    }
    return result;
  };

  // Actualizar una mesa existente
  const updateTable = async (id, TableData) => {
    const result = await put(`tables/${id}`, TableData);
    if (!result.error) {
      await fetchTables(); // Recargar la lista
    }
    return result;
  };

  // Eliminar una mesa
  const deleteTable = async (id) => {
    const result = await remove(`tables/${id}`);
    if (!result.error) {
      await fetchTables(); // Recargar la lista
    }
    return result;
  };

  return {
    tables,
    loading,
    error,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
  };
}
