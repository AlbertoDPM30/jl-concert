"use client";

import { useState, useEffect } from "react";
import useApi from "./useApi";

export default function useAssigned() {
  const { data, loading, error, get, post, put, remove } = useApi();
  const [assigned, setAssigned] = useState([]);

  useEffect(() => {
    if (data) {
      setAssigned(Array.isArray(data) ? data : []);
    }
  }, [data]);

  // Obtener todas las asignaciones
  const fetchAssigned = async () => {
    await get("assigned");
  };

  // Obtener asignaciones por mesa
  const fetchAssignedByTable = async (tableId) => {
    await get(`tables/${tableId}/assigned`);
  };

  // Crear una nueva asignación
  const createAssigned = async (assignedData) => {
    const result = await post("assigned", assignedData);
    if (!result.error) {
      await fetchAssigned();
    }
    return result;
  };

  // Actualizar una asignación existente
  const updateAssigned = async (id, assignedData) => {
    const result = await put(`assigned/${id}`, assignedData);
    if (!result.error) {
      await fetchAssigned();
    }
    return result;
  };

  // Eliminar una asignación
  const deleteAssigned = async (id) => {
    const result = await remove(`assigned/${id}`);
    if (!result.error) {
      await fetchAssigned();
    }
    return result;
  };

  return {
    assigned,
    loading,
    error,
    fetchAssigned,
    fetchAssignedByTable,
    createAssigned,
    updateAssigned,
    deleteAssigned,
  };
}
