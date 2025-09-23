// src/layouts/NewAppointmentLayout.jsx
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function NewAppointmentLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Función auxiliar para verificar si la ruta está activa
const isActiveRoute = (path) => {
  if (path === "/appointments/new") {
    return location.pathname === path;
  }
  // Corregido: ahora verifica la ruta correcta para "Mis Citas"
  if (path === "/appointments/my-appointments") {
    return location.pathname.startsWith("/appointments/my-appointments");
  }
  // Para "Histórico"
  if (path === "/appointments/history") {
    return location.pathname.startsWith("/appointments/history");
  }
  return false;
};

  return (
    <>
      {/* Navegación para desktop */}
      <nav className="hidden md:flex my-5 gap-3">
        <NavLink
          to="/appointments/new"
          end
          className={({ isActive }) =>
            `flex-1 text-center p-3 uppercase font-extrabold rounded-lg transition-colors ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
            }`
          }
        >
          Servicios
        </NavLink>
        <NavLink
          to="/appointments/my-appointments"
          className={({ isActive }) =>
            `flex-1 text-center p-3 uppercase font-extrabold rounded-lg transition-colors ${
              isActive || isActiveRoute("/appointments/my-appointments")
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
            }`
          }
        >
          Mis Citas
        </NavLink>
        <NavLink
          to="/appointments/history"
          className={({ isActive }) =>
            `flex-1 text-center p-3 uppercase font-extrabold rounded-lg transition-colors ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
            }`
          }
        >
          Histórico
        </NavLink>
      </nav>

      {/* Navegación para móviles */}
      <div className="md:hidden my-5">
        {/* Botón del menú hamburguesa */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex justify-between items-center p-3 bg-blue-600 text-white rounded-lg shadow-md font-bold"
          aria-label="Abrir menú de navegación"
        >
          {/* Icono de hamburguesa (tres rayas) */}
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg
            className={`w-5 h-5 ml-2 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Menú desplegable */}
        <div
          className={`mt-2 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-48" : "max-h-0"
          }`}
        >
          <NavLink
            to="/appointments/new"
            end
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) =>
              `block p-3 border-b border-gray-100 font-bold transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            Servicios
          </NavLink>
          <NavLink
            to="/appointments/my-appointments"
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) =>
              `block p-3 border-b border-gray-100 font-bold transition-colors ${
                isActive || isActiveRoute("/appointments/my-appointments")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            Mis Citas
          </NavLink>
          <NavLink
            to="/appointments/history"
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) =>
              `block p-3 font-bold transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            Histórico
          </NavLink>
        </div>
      </div>

      <Outlet />
    </>
  );
}
