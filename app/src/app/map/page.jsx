// app/map/page.js
import React from "react";

// Componente para los elementos dentro de las zonas
const MapItem = ({ variant = "green-circle" }) => {
  let className = "absolute";
  if (variant === "green-circle") {
    className += " w-8 h-8 rounded-full bg-green-500 border border-green-700";
  } else if (variant === "gray-rect") {
    className += " w-10 h-4 bg-gray-400 border border-gray-600";
  }
  return <div className={className}></div>;
};

export default function MapPage() {
  return (
    <div className="relative min-h-screen bg-gray-300 flex justify-center py-8 overflow-hidden">
      {/* Marco superior */}
      <div className="absolute top-0 w-64 h-24 bg-black border-4 border-white z-10">
        Tarima
      </div>

      {/* Barras laterales verticales */}
      <div className="absolute top-30 bottom-0 left-0 w-[20%] h-[70dvh] bg-white border-4 border-black"></div>
      <div className="absolute top-30 bottom-0 right-0 w-[20%] h-[70dvh] bg-white border-4 border-black"></div>

      {/* Contenedor principal de las zonas */}
      <div className="w-[55%] bg-gray-400 shadow-xl border-4 border-gray-700 relative z-0 mt-20 mb-20">
        {/* Ajustado con mt-20 para dejar espacio al marco superior */}
        {/* Zona A */}
        <div className="relative bg-blue-600 h-[50dvh] p-4 border-4 border-gray-700">
          <span className="absolute top-2 left-2 text-white text-lg font-bold">
            ZONA "A"
          </span>
          <MapItem variant="green-circle" style={{ top: "20%", left: "10%" }} />
          <MapItem variant="gray-rect" style={{ top: "20%", left: "25%" }} />
          <MapItem variant="green-circle" style={{ top: "20%", left: "40%" }} />
          <MapItem variant="gray-rect" style={{ top: "20%", left: "55%" }} />
          <MapItem variant="green-circle" style={{ top: "20%", left: "70%" }} />

          <MapItem variant="gray-rect" style={{ top: "60%", left: "10%" }} />
          <MapItem variant="green-circle" style={{ top: "60%", left: "25%" }} />
          <MapItem variant="gray-rect" style={{ top: "60%", left: "40%" }} />
          <MapItem variant="green-circle" style={{ top: "60%", left: "55%" }} />
          <MapItem variant="gray-rect" style={{ top: "60%", left: "70%" }} />
        </div>
        {/* Zona B */}
        <div className="relative bg-blue-600 h-[50dvh] p-4 border-4 border-gray-700">
          <span className="absolute top-2 left-2 text-white text-lg font-bold">
            ZONA "B"
          </span>
          <MapItem variant="green-circle" style={{ top: "20%", left: "10%" }} />
          <MapItem variant="gray-rect" style={{ top: "20%", left: "25%" }} />
          <MapItem variant="green-circle" style={{ top: "20%", left: "40%" }} />
          <MapItem variant="gray-rect" style={{ top: "20%", left: "55%" }} />
          <MapItem variant="green-circle" style={{ top: "20%", left: "70%" }} />

          <MapItem variant="gray-rect" style={{ top: "60%", left: "10%" }} />
          <MapItem variant="green-circle" style={{ top: "60%", left: "25%" }} />
          <MapItem variant="gray-rect" style={{ top: "60%", left: "40%" }} />
          <MapItem variant="green-circle" style={{ top: "60%", left: "55%" }} />
          <MapItem variant="gray-rect" style={{ top: "60%", left: "70%" }} />
        </div>
      </div>
    </div>
  );
}
