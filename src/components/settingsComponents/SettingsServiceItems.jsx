// src/components/settingsComponents/SettingsServiceItems.jsx
import React from "react";
import Button from "@/components/ui/Button";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/helpers/helpers";

const SettingsServiceItems = ({ service, onEdit, onDelete }) => {
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

        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            icon={<PencilIcon className="h-4 w-4" />}
            onClick={() => onEdit(service)}
          >
            Editar
          </Button>
          <Button
            variant="danger-outline"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => onDelete(service)}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsServiceItems;
