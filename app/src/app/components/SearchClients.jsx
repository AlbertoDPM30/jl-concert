"use client";

import { useState, useEffect, useRef } from "react";
import useClients from "../hooks/useClients";
import useAssigned from "../hooks/useAssigned";
import useChairs from "../hooks/useChairs";
import useTables from "../hooks/useTables";
import { useAuth } from "../../../context/AuthContext";
import {
  User,
  Phone,
  IdCard,
  Search,
  X,
  Armchair,
  MapPin,
  LogOut,
} from "lucide-react";

const SearchClients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientAssignments, setClientAssignments] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const inputRef = useRef(null);
  const userMenuRef = useRef(null);

  // Hooks para obtener datos
  const { clients, fetchClients } = useClients();
  const { assigned, fetchAssigned } = useAssigned();
  const { chairs, fetchChairs } = useChairs();
  const { tables, fetchTables } = useTables();

  // Obtener datos de autenticación
  const { user, logout } = useAuth();

  // Función para actualizar todos los datos
  const refreshAllData = () => {
    fetchClients();
    fetchAssigned();
    fetchChairs();
    fetchTables();
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    refreshAllData();
  }, []);

  // Cerrar menú de logout al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtrar clientes basado en la búsqueda
  const filteredClients = clients.filter(
    (client) =>
      client.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ci?.includes(searchTerm) ||
      client.phone_number?.includes(searchTerm)
  );

  // Obtener asignaciones del cliente seleccionado
  const getClientAssignments = (clientId) => {
    return assigned
      .filter((assignment) => assignment.id_client === clientId)
      .map((assignment) => {
        const chair = chairs.find((c) => c.id === assignment.id_chair);
        const table = tables.find((t) => t.id === assignment.id_table);
        return {
          ...assignment,
          chair,
          table,
        };
      });
  };

  // Agrupar asignaciones por mesa
  const getGroupedAssignments = (assignments) => {
    const grouped = {};

    assignments.forEach((assignment) => {
      const tableId = assignment.id_table;
      if (!grouped[tableId]) {
        grouped[tableId] = {
          table: assignment.table,
          chairs: [],
        };
      }
      if (assignment.chair) {
        grouped[tableId].chairs.push(assignment.chair.number);
      }
    });

    // Ordenar números de sillas
    Object.keys(grouped).forEach((tableId) => {
      grouped[tableId].chairs.sort((a, b) => a - b);
    });

    return grouped;
  };

  // Manejar click en cliente
  const handleClientClick = (client) => {
    setSelectedClient(client);
    const assignments = getClientAssignments(client.id);
    setClientAssignments(assignments);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setSelectedClient(null);
    setClientAssignments([]);
  };

  // Manejar focus del input - actualizar datos
  const handleInputFocus = () => {
    refreshAllData(); // Actualizar datos al hacer focus
    setIsInputFocused(true);
  };

  // Manejar blur del input
  const handleInputBlur = () => {
    setTimeout(() => setIsInputFocused(false), 200);
  };

  // Manejar logout
  const handleLogout = () => {
    logout();
    setShowLogout(false);
  };

  // Toggle menú de usuario
  const toggleUserMenu = () => {
    setShowLogout(!showLogout);
  };

  // Determinar si debemos mostrar los resultados
  const shouldShowResults = isInputFocused || searchTerm.length > 0;

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 sm:p-6`}>
      {/* Header con información de usuario */}
      <div className="mb-6 flex justify-end items-center">
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full">
              <User size={16} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-indigo-800 group-hover:text-indigo-900">
                {user?.name || user?.email || "Usuario"}
              </p>
            </div>
          </button>

          {/* Menú de logout */}
          {showLogout && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Buscar por nombre, cédula o teléfono..."
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Resultados de búsqueda - Solo se muestra cuando hay foco o término de búsqueda */}
      {shouldShowResults && (
        <div className="space-y-3">
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No se encontraron clientes"
                : "Ingresa un término de búsqueda"}
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientClick(client)}
                className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <User size={24} className="text-indigo-600 sm:size-8" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-400 truncate">
                        {client.fullname}
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <IdCard size={14} className="sm:size-4" />
                          <span className="truncate">CI: {client.ci}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="sm:size-4" />
                          <span className="truncate">
                            Tel: {client.phone_number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-xs sm:text-sm text-gray-500">
                      {getClientAssignments(client.id).length > 0 ? (
                        <span className="text-green-600 font-medium">
                          {getClientAssignments(client.id).length}{" "}
                          asignación(es)
                        </span>
                      ) : (
                        <span className="text-gray-400">Sin asignaciones</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de detalles del cliente */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Detalles del Cliente
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              >
                <X size={20} className="sm:size-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {/* Información del cliente */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Información Personal
                </h3>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User
                        size={20}
                        className="text-indigo-600 mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-black">
                          Nombre completo:
                        </span>
                        <p className="text-slate-700 wrap-break-word">
                          {selectedClient.fullname}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IdCard
                        size={20}
                        className="text-indigo-600 mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-black">
                          Cédula de identidad:
                        </span>
                        <p className="text-slate-700 wrap-break-word">
                          {selectedClient.ci}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone
                        size={20}
                        className="text-indigo-600 mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-black">
                          Teléfono:
                        </span>
                        <p className="text-slate-700 wrap-break-word">
                          {selectedClient.phone_number}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mesas asignadas */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Mesas Asignadas
                </h3>
                {clientAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      getGroupedAssignments(clientAssignments)
                    ).map(([tableId, { table, chairs }]) => (
                      <div
                        key={tableId}
                        className="border border-green-200 bg-green-50 rounded-lg p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={20}
                              className="text-green-600 shrink-0"
                            />
                            <span className="font-semibold text-black">
                              Mesa #{table?.number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Armchair
                              size={18}
                              className="text-green-600 shrink-0"
                            />
                            <span className="text-sm text-gray-700">
                              Sillas: {chairs.join(", ")}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-black">
                              Información de la mesa:
                            </span>
                            <ul className="mt-1 space-y-1 text-slate-700">
                              <li>• Número: {table?.number}</li>
                              <li>
                                • Cantidad de sillas: {table?.chair_quantity}
                              </li>
                              <li>
                                • Estado:{" "}
                                {table?.status === 1 ? "Ocupada" : "Libre"}
                              </li>
                              <li>• Sillas asignadas: {chairs.length}</li>
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-black">
                              Información de las sillas:
                            </span>
                            <ul className="mt-1 space-y-1 text-slate-700">
                              <li>• Números: {chairs.join(", ")}</li>
                              <li>• Total asignadas: {chairs.length}</li>
                              <li>• Estado: Ocupadas</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <User size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">
                      El cliente no tiene mesas asignadas
                    </p>
                  </div>
                )}
              </div>

              {/* Botón cerrar */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchClients;
