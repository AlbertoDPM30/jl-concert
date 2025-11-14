"use client";

import { useAuth } from "../../../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-800">Mi Dashboard Privado</h1>
      <p className="mt-4 text-lg text-gray-600">
        ¡Bienvenido, {user ? user.name : "usuario"}! Solo ves esto si estás
        loggeado.
      </p>

      {/* Ejemplo de botón de Logout */}
      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

// Exportamos el componente envuelto en ProtectedRoute
export default function DashboardPage() {
  return (
    // <ProtectedRoute> envolverá todo el contenido de la página.
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
