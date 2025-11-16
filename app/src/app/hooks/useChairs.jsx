"use client";

import { useState, useEffect } from "react";
import useApi from "./useApi";

export default function useChairs() {
  const { data, loading, error, get, post, put, remove } = useApi();
  const [chairs, setChairs] = useState([]);

  useEffect(() => {
    if (data) {
      setChairs(Array.isArray(data) ? data : []);
    }
  }, [data]);

  // Obtener todas las sillas
  const fetchChairs = async () => {
    await get("chairs");
  };

  // Obtener sillas por mesa
  const fetchChairsByTable = async (tableId) => {
    await get(`tables/${tableId}/chairs`);
  };

  // Crear una nueva silla
  const createChair = async (chairData) => {
    const result = await post("chairs", chairData);
    if (!result.error) {
      await fetchChairs();
    }
    return result;
  };

  // Actualizar una silla existente
  const updateChair = async (id, chairData) => {
    const result = await put(`chairs/${id}`, chairData);
    if (!result.error) {
      await fetchChairs();
    }
    return result;
  };

  // Eliminar una silla
  const deleteChair = async (id) => {
    const result = await remove(`chairs/${id}`);
    if (!result.error) {
      await fetchChairs();
    }
    return result;
  };

  return {
    chairs,
    loading,
    error,
    fetchChairs,
    fetchChairsByTable,
    createChair,
    updateChair,
    deleteChair,
  };
}
