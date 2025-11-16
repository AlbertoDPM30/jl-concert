"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, User, Phone, IdCard } from "lucide-react";
import useClients from "../hooks/useClients"; // Ajusta la ruta según tu estructura

export default function ClientsPage() {
  const {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  } = useClients();
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    ci: "",
    phone_number: "",
  });

  // Cargar clients al montar el componente
  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async () => {
    const result = await createClient(formData);
    if (!result.error) {
      setIsCreating(false);
      resetForm();
    }
  };

  const handleUpdate = async (id) => {
    const result = await updateClient(id, formData);
    if (!result.error) {
      setEditingId(null);
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      await deleteClient(id);
    }
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setFormData({
      fullname: client.fullname,
      ci: client.ci,
      phone_number: client.phone_number,
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    resetForm();
  };

  const cancelAction = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fullname: "",
      ci: "",
      phone_number: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los clientes del sistema
          </p>
        </div>

        {/* Botón Agregar */}
        <div className="mb-6">
          <button
            onClick={startCreate}
            disabled={isCreating || editingId}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>

        {/* Formulario de Creación/Edición */}
        {(isCreating || editingId) && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {isCreating ? "Crear Nuevo Cliente" : "Editar Cliente"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula de Identidad
                </label>
                <div className="relative">
                  <IdCard
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="ci"
                    value={formData.ci}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345678"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={
                  isCreating ? handleCreate : () => handleUpdate(editingId)
                }
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save size={18} />
                {isCreating ? "Crear" : "Actualizar"}
              </button>
              <button
                onClick={cancelAction}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Mensajes de Estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Cargando clientes...</p>
          </div>
        )}

        {/* Lista de Clientes */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay clientes
                </h3>
                <p className="text-gray-500">
                  Comienza agregando tu primer cliente.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre Completo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cédula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {client.fullname}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <IdCard size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">
                              {client.ci}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Phone size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">
                              {client.phone_number}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(client)}
                              disabled={isCreating || editingId}
                              className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white p-2 rounded transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              disabled={isCreating || editingId}
                              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white p-2 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
