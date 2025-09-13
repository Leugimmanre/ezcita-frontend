// src/components/settingsComponents/SettingsServiceItems.jsx
import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/helpers/helpers";

const SettingsServiceItems = ({ service, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Formatear duración
  const formatDuration = (duration, unit) => {
    const totalMinutes =
      unit === "horas" || unit === "hours"
        ? Number(duration) * 60
        : Number(duration);

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  };

  return (
    <div className="p-4 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">
              {service.name}
            </h3>
            {service.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {service.category}
              </span>
            )}
          </div>

          {/* Imagen principal del servicio */}
          {service.images?.length > 0 && (
            <img
              src={service.images[0].url}
              alt={service.images[0].alt || service.name}
              className="h-12 w-12 rounded-md object-cover border"
            />
          )}

          {service.description && (
            <p className="text-sm text-gray-600">{service.description}</p>
          )}

          <div className="mt-2 flex items-center gap-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Precio:</span>{" "}
              {formatCurrency(service.price)}
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Duración:</span>{" "}
              {formatDuration(service.duration, service.durationUnit)}
            </div>
          </div>
        </div>

        {/* Botón de tres puntos y menú desplegable (reemplaza los botones anteriores) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-150"
            aria-label="Opciones del servicio"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onEdit(service);
                  setIsMenuOpen(false);
                }}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar servicio
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  onDelete(service);
                  setIsMenuOpen(false);
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Eliminar servicio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsServiceItems;
