// components/ProtectedRoute.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

/**
 * Componente que protege rutas.
 * Redirige a la página principal si el usuario no está autenticado.
 * * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos a proteger.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // useEffect se ejecuta después del renderizado
  useEffect(() => {
    // Si aún está cargando el estado de autenticación, no hacemos nada
    if (loading) {
      return;
    }

    // Si NO está autenticado, redirigimos.
    if (!isAuthenticated) {
      router.push("/login");
      console.log("Redirigiendo: Usuario no autenticado");
    }
  }, [isAuthenticated, loading, router]); // Dependencias del efecto

  // 1. Mostrar un mensaje de carga mientras se verifica el estado.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-700">
        Verificando autenticación...
      </div>
    );
  }

  // 2. Si está autenticado, renderiza los hijos (el contenido protegido).
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 3. Si no está autenticado, no renderiza nada (la redirección ya fue disparada).
  return null;
}
