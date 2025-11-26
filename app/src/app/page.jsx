"use client";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import React, { useEffect, useState } from "react";
import useApi from "./hooks/useApi.jsx";
import useChairs from "./hooks/useChairs";
import useAssigned from "./hooks/useAssigned";
import useClients from "./hooks/useClients";
import useTables from "./hooks/useTables"; // Importar useTables
import SearchClients from "./components/SearchClients.jsx";
import {
  User,
  Phone,
  IdCard,
  Search,
  Plus,
  X,
  Trash2,
  Armchair,
  Save,
  Bookmark, // Icono para Reservado
} from "lucide-react";

// --- COMPONENTE DE MODAL PARA GESTIÓN DE MESAS ---
const TableManagementModal = ({ tableId, onClose, onDataUpdated }) => {
  const [selectedChair, setSelectedChair] = useState(null);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClientData, setNewClientData] = useState({
    fullname: "",
    ci: "",
    phone_number: "",
  });

  // Hooks para obtener datos
  const {
    chairs,
    loading: chairsLoading,
    error: chairsError,
    fetchChairsByTable,
  } = useChairs();
  const {
    assigned,
    loading: assignedLoading,
    error: assignedError,
    fetchAssignedByTable,
    createAssigned,
    deleteAssigned,
  } = useAssigned();
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    fetchClients,
    createClient,
  } = useClients();

  // Hook para actualizar el estado de la mesa
  const { updateTable } = useTables();

  // Estados combinados
  const isLoading = chairsLoading || assignedLoading || clientsLoading;
  const hasError = chairsError || assignedError || clientsError;

  // Cargar datos al montar el componente
  useEffect(() => {
    if (tableId) {
      fetchChairsByTable(tableId);
      fetchAssignedByTable(tableId);
      fetchClients();
    }
  }, [tableId]);

  // Función para manejar la reserva de la mesa
  const handleReserveTable = async () => {
    try {
      // Obtener la cantidad de sillas de la mesa actual
      const chairQuantity = chairs.length;
      await updateTable(tableId, {
        status: 2,
        chair_quantity: chairQuantity, // Incluir chair_quantity requerido
      });
      // Notificar al componente padre que los datos han cambiado
      if (onDataUpdated) {
        onDataUpdated();
      }
      onClose(); // Cerrar el modal después de reservar
    } catch (error) {
      console.error("Error al reservar la mesa:", error);
    }
  };

  // Filtrar clientes basado en la búsqueda
  const filteredClients = clients.filter(
    (client) =>
      client.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ci?.includes(searchTerm)
  );

  // Obtener cliente asignado a una silla
  const getClientForChair = (chairId) => {
    // Buscar en todas las asignaciones posibles
    const assignment = assigned.find((a) => {
      // Verificar diferentes estructuras posibles
      if (a.id_chair === chairId) {
        return true;
      }
      return false;
    });

    if (assignment) {
      // Extraer cliente de diferentes estructuras posibles
      let client = null;

      // Estructura 1: assignment.client
      if (assignment.client) {
        client = assignment.client;
      }
      // Estructura 2: assignment.chair.client
      else if (assignment.chair && assignment.chair.client) {
        client = assignment.chair.client;
      }
      // Estructura 3: datos directos en la asignación
      else if (assignment.fullname || assignment.ci) {
        client = {
          fullname: assignment.fullname,
          ci: assignment.ci,
          phone_number: assignment.phone_number,
        };
      }

      return client;
    }

    return null;
  };

  // Manejar click en silla
  const handleChairClick = (chair) => {
    const client = getClientForChair(chair.id);
    const assignment = assigned.find(
      (a) =>
        a.id_chair === chair.id ||
        a.chair_id === chair.id ||
        (a.chair && a.chair.id === chair.id)
    );

    setSelectedChair({
      ...chair,
      client,
      assignment,
    });
    setShowClientSearch(false);
    setShowClientForm(false);
  };

  // Manejar asignación de cliente existente
  const handleAssignClient = async (client) => {
    try {
      await createAssigned({
        id_client: client.id,
        id_table: parseInt(tableId),
        id_chair: selectedChair.id,
      });
      // Refrescar datos
      fetchAssignedByTable(tableId);
      // Notificar al componente padre que los datos han cambiado
      if (onDataUpdated) {
        onDataUpdated();
      }
      setShowClientSearch(false);
      setSelectedChair(null);
    } catch (error) {
      console.error("Error al asignar cliente:", error);
    }
  };

  // Manejar creación y asignación de nuevo cliente
  const handleCreateAndAssign = async () => {
    try {
      const result = await createClient(newClientData);
      if (result && !result.error) {
        const newClient = result.data || result;
        await createAssigned({
          id_client: newClient.id,
          id_table: parseInt(tableId),
          id_chair: selectedChair.id,
        });
        // Refrescar datos
        fetchClients();
        fetchAssignedByTable(tableId);
        // Notificar al componente padre que los datos han cambiado
        if (onDataUpdated) {
          onDataUpdated();
        }
        setShowClientForm(false);
        setSelectedChair(null);
        setNewClientData({ fullname: "", ci: "", phone_number: "" });
      }
    } catch (error) {
      console.error("Error al crear y asignar cliente:", error);
    }
  };

  // Manejar eliminación de asignación
  const handleRemoveAssignment = async (assignmentId) => {
    try {
      await deleteAssigned(assignmentId);
      fetchAssignedByTable(tableId);
      // Notificar al componente padre que los datos han cambiado
      if (onDataUpdated) {
        onDataUpdated();
      }
      setSelectedChair(null);
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Mesa #{tableId}
        </h2>
        <div className="flex items-center gap-2">
          {/* Botón Reservado */}
          <button
            onClick={handleReserveTable}
            disabled={hasError || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasError || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
            title="Reservar toda la mesa"
          >
            <Bookmark size={16} />
            Reservado
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Mostrar errores */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p>Error al cargar los datos. Por favor, intenta nuevamente.</p>
          {chairsError && <p className="text-sm mt-1">Sillas: {chairsError}</p>}
          {assignedError && (
            <p className="text-sm mt-1">Asignaciones: {assignedError}</p>
          )}
          {clientsError && (
            <p className="text-sm mt-1">Clientes: {clientsError}</p>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando datos...</span>
        </div>
      )}

      {/* Lista de Sillas */}
      {!isLoading && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Sillas de la Mesa
          </h3>
          {chairs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay sillas en esta mesa.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {chairs.map((chair) => {
                const client = getClientForChair(chair.id);
                const isOccupied = client !== null;

                return (
                  <div
                    key={chair.id}
                    onClick={() => handleChairClick(chair)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-black ${
                      isOccupied
                        ? "bg-green-100 border-green-500 hover:bg-green-200"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    } ${hasError ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Armchair
                        size={20}
                        className={
                          isOccupied ? "text-green-600" : "text-gray-400"
                        }
                      />
                      <span className="text-sm font-medium">
                        Silla #{chair.number}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {isOccupied ? (
                        <div>
                          <div className="font-medium text-green-800 truncate">
                            {client?.fullname || "Cliente asignado"}
                          </div>
                          <div>CI: {client?.ci || "N/A"}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Disponible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detalles de Silla Seleccionada */}
      {selectedChair && !isLoading && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Silla #{selectedChair.number} -{" "}
            {selectedChair.client ? "Ocupada" : "Disponible"}
          </h3>

          {selectedChair.client ? (
            // Mostrar datos del cliente asignado
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">
                Cliente Asignado
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  <span className="font-medium text-black">Nombre:</span>
                  <span className="text-slate-500">
                    {selectedChair.client.fullname}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard size={16} className="text-blue-600" />
                  <span className="font-medium text-black">CI:</span>
                  <span className="text-slate-500">
                    {selectedChair.client.ci}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-blue-600" />
                  <span className="font-medium text-black">Teléfono:</span>
                  <span className="text-slate-500">
                    {selectedChair.client.phone_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  handleRemoveAssignment(selectedChair.assignment.id)
                }
                disabled={hasError}
                className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  hasError
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <Trash2 size={16} />
                Liberar Silla
              </button>
            </div>
          ) : (
            // Opciones para silla disponible
            <div className="space-y-4">
              {!showClientSearch && !showClientForm && (
                <button
                  onClick={() => setShowClientSearch(true)}
                  disabled={hasError}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    hasError
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <User size={16} />
                  Asignar Cliente
                </button>
              )}

              {/* Buscador de Clientes */}
              {showClientSearch && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-black">
                    Buscar Cliente
                  </h4>
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o CI..."
                        className="w-full pl-10 pr-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={hasError}
                      />
                    </div>
                  </div>

                  {/* Lista de Clientes Encontrados */}
                  {filteredClients.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() =>
                            !hasError && handleAssignClient(client)
                          }
                          className={`p-3 border border-gray-200 rounded-lg transition-colors ${
                            hasError
                              ? "bg-gray-100 cursor-not-allowed"
                              : "hover:bg-blue-50 cursor-pointer"
                          }`}
                        >
                          <div className="font-medium text-black">
                            {client.fullname}
                          </div>
                          <div className="text-sm text-gray-600">
                            CI: {client.ci}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-3">
                        No se encontraron clientes
                      </p>
                      <button
                        onClick={() => {
                          setShowClientSearch(false);
                          setShowClientForm(true);
                        }}
                        disabled={hasError}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mx-auto ${
                          hasError
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        <Plus size={16} />
                        Crear Nuevo Cliente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Formulario de Nuevo Cliente */}
              {showClientForm && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">
                    Crear Nuevo Cliente
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={newClientData.fullname}
                        onChange={(e) =>
                          setNewClientData((prev) => ({
                            ...prev,
                            fullname: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Juan Pérez"
                        disabled={hasError}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cédula de Identidad
                      </label>
                      <input
                        type="text"
                        value={newClientData.ci}
                        onChange={(e) =>
                          setNewClientData((prev) => ({
                            ...prev,
                            ci: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="12345678"
                        disabled={hasError}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={newClientData.phone_number}
                        onChange={(e) =>
                          setNewClientData((prev) => ({
                            ...prev,
                            phone_number: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="04141234567"
                        disabled={hasError}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateAndAssign}
                        disabled={hasError}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          hasError
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        <Save size={16} />
                        Crear y Asignar
                      </button>
                      <button
                        onClick={() => {
                          setShowClientForm(false);
                          setShowClientSearch(true);
                        }}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- CONSTANTES DE DISTRIBUCIÓN ---
const ZONE_A_COUNT = 48;
const ZONE_B_COUNT = 36;
const LATERAL_A_COUNT = 18;
const LATERAL_B_COUNT = 18;

// El resto de las mesas irán a la Zona C
const ZONE_C_COUNT = LATERAL_A_COUNT + LATERAL_B_COUNT;

// --- COMPONENTES AUXILIARES ---
const MapItem = ({ table, onSelect, style }) => {
  if (!table) return null;

  // Determinar el color basado en el estado de la mesa
  let colorClass = "";
  let statusText = "";

  switch (table.status) {
    case 1: // Ocupada
      colorClass = "bg-red-500 border-red-700 hover:bg-red-600";
      statusText = "OCUPADA";
      break;
    case 2: // Reservada
      colorClass = "bg-gray-500 border-gray-700 hover:bg-gray-600";
      statusText = "RESERVADA";
      break;
    default: // Libre (status 0 u otro)
      colorClass = "bg-green-500 border-green-700 hover:bg-green-600";
      statusText = "LIBRE";
      break;
  }

  return (
    <div
      onClick={() => onSelect(table)}
      className={`w-8 h-8 rounded-full border shadow-md ${colorClass} 
         flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all duration-150 transform hover:scale-110`}
      style={style}
      title={`Mesa #${table.number} - Sillas: ${table.chair_quantity} - Estado: ${statusText} (Clic para gestionar asignaciones)`}
    >
      {table.number}
    </div>
  );
};

const MapZone = ({
  name,
  tables = [],
  className = "",
  cols = 8,
  onTableSelect,
}) => {
  if (!tables || tables.length === 0)
    return (
      <div
        className={`relative bg-blue-600 p-6 border-4 border-gray-700 ${className}`}
      >
        <span className="absolute top-2 left-2 text-white text-lg font-bold">
          VIP "{name}"
        </span>
        <p className="text-center text-gray-200 mt-10">
          No hay mesas asignadas a esta zona.
        </p>
      </div>
    );

  const rows = Math.ceil(tables.length / cols);

  return (
    <div
      className={`relative bg-blue-600 border-4 border-gray-700 p-6 ${className}`}
    >
      <span className="absolute top-2 left-2 text-white text-lg font-bold">
        VIP "{name}"
      </span>
      <div
        className="relative mt-10 grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {tables.map((table) => (
          <MapItem key={table.id} table={table} onSelect={onTableSelect} />
        ))}
      </div>
    </div>
  );
};

// --- CONTENIDO PRINCIPAL DE LA PÁGINA ---
function HomeContent() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data: allTables, loading, error, get } = useApi();

  // Función para forzar la actualización de datos
  const refreshTables = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Cargar mesas cuando el componente se monta o cuando se activa el refreshTrigger
  useEffect(() => {
    get("tables");
  }, [refreshTrigger]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
  };

  // --- LÓGICA DE DISTRIBUCIÓN DE MESAS ---
  let zoneA = [];
  let zoneB = [];
  let VIPOroA = [];
  let VIPOroB = [];
  let zoneC = [];

  if (allTables && Array.isArray(allTables)) {
    const sortedTables = [...allTables].sort((a, b) => a.number - b.number);
    let currentTables = sortedTables;

    zoneA = currentTables.slice(0, ZONE_A_COUNT);
    currentTables = currentTables.slice(ZONE_A_COUNT);

    zoneB = currentTables.slice(0, ZONE_B_COUNT);
    currentTables = currentTables.slice(ZONE_B_COUNT);

    VIPOroA = currentTables.slice(0, LATERAL_A_COUNT);
    currentTables = currentTables.slice(LATERAL_A_COUNT);

    VIPOroB = currentTables.slice(0, LATERAL_B_COUNT);
    currentTables = currentTables.slice(LATERAL_B_COUNT);

    zoneC = currentTables;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <h1 className="text-xl font-semibold text-blue-700">
          Cargando Mesas...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <h1 className="text-xl font-semibold text-red-600">
          Error al cargar las mesas de la API: {error}
        </h1>
        <p className="text-gray-600 mt-2">
          Verifica que tu servidor Laravel esté corriendo.
        </p>
      </div>
    );
  }

  return (
    <div className="relative max-md:w-[800px] max-md:h-auto min-h-screen bg-gray-300 flex justify-center py-8 overflow-x-auto">
      {/* Modal de gestión de mesas */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <TableManagementModal
            tableId={selectedTable.id}
            onClose={handleCloseModal}
            onDataUpdated={refreshTables} // Pasamos la función de actualización
          />
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-white text-4xl font-bold p-2 rounded-full bg-red-600 hover:bg-red-700 z-60 shadow-xl transition-transform transform hover:scale-105"
            aria-label="Cerrar modal de asignaciones"
          >
            &times;
          </button>
        </div>
      )}

      {/* Marco superior (Tarima) */}
      <div className="absolute top-0 w-64 h-24 bg-black border-4 border-white z-10 flex items-center justify-center text-white font-bold rounded-b-xl">
        Tarima
      </div>

      {/* Barras laterales verticales - VIP Oro A (Izquierda) */}
      <div className="absolute top-40 bottom-0 left-0 w-fit md:w-[20%] h-fit bg-orange-200 border-4 border-black p-4 overflow-y-auto rounded-r-xl shadow-lg">
        <h2 className="text-xl font-bold mb-3 text-gray-800 border-b pb-1">
          VIP Oro A
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {VIPOroA.map((table) => (
            <MapItem key={table.id} table={table} onSelect={handleTableClick} />
          ))}
        </div>
      </div>

      {/* Barras laterales verticales - VIP Oro B (Derecha) */}
      <div className="absolute top-40 bottom-0 right-0 w-fit md:w-[20%] h-fit bg-orange-200 border-4 border-black p-4 overflow-y-auto rounded-l-xl shadow-lg">
        <h2 className="text-xl font-bold mb-3 text-gray-800 border-b pb-1">
          VIP Oro B
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {VIPOroB.map((table) => (
            <MapItem key={table.id} table={table} onSelect={handleTableClick} />
          ))}
        </div>
      </div>

      {/* Contenedor principal de las zonas (Centro) */}
      <div className="w-fit md:w-[55%] bg-gray-400 shadow-2xl border-4 border-gray-700 relative z-0 mt-32 mb-20 space-y-4 p-4 rounded-xl">
        {/* ZONA A: Diamante */}
        <MapZone
          name="Diamante"
          tables={zoneA}
          cols={8}
          onTableSelect={handleTableClick}
          className="rounded-xl"
        />
        {/* ZONA B: Platino */}
        <MapZone
          name="Platino"
          tables={zoneB}
          cols={6}
          onTableSelect={handleTableClick}
          className="rounded-xl"
        />
        {/* ZONA C: Bronce */}
        {zoneC.length > 0 && (
          <MapZone
            name="Bronce"
            tables={zoneC}
            cols={8}
            onTableSelect={handleTableClick}
            className="rounded-xl"
          />
        )}
      </div>

      {/* ZONA DE ENTRADA */}
      {/* <div className="absolute right-16 bottom-20 bg-yellow-400 p-4 transform translate-x-full -mr-4 border-2 border-yellow-600 shadow-xl rounded-lg">
        <span className="text-black font-bold whitespace-nowrap">
          ZONA DE ENTRADA
        </span>
        <span className="block text-2xl text-black leading-none mt-1">←</span>
      </div> */}
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <SearchClients />
      <HomeContent />
    </ProtectedRoute>
  );
}
