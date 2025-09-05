// src/components/servicesComponents/ServiceItem.jsx
import React from "react";
import Button from "@/components/ui/Button";
import {
  CheckIcon,
  PlusIcon,
  ClockIcon,
  TagIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function ServiceItem({
  service,
  isSelected,
  isDisabled,
  onSelect,
  formattedPrice,
  formattedDuration,
}) {
  return (
    <div
      className={`p-5 rounded-xl transition-all cursor-pointer border ${
        isSelected
          ? "bg-blue-500/10 border-blue-500"
          : "bg-gray-800/50 border-gray-700 hover:border-gray-500"
      } ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={() => !isDisabled && onSelect(service)}
    >
      <div className="flex justify-between items-start">
        <div className="w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-white">
                {service.name}
              </h3>
              {/* Imagen principal del servicio - MEJORADO */}
              {service.images?.length > 0 && (
                <div className="mb-3 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 flex justify-center items-center h-48">
                  <img
                    src={service.images[0].url}
                    alt={service.images[0].alt || service.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = "/images/placeholder-service.jpg";
                      e.target.className = "w-full h-48 object-cover";
                    }}
                  />
                </div>
              )}
              <div className="flex items-center space-x-1 mt-1">
                <TagIcon className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-400 mt-0">{service.category}</p>
              </div>
            </div>
            <span className="text-lg font-bold text-blue-300">
              {formattedPrice}
            </span>
          </div>
          {/* Descripción del servicio */}
          {service.description && (
            <div className="flex items-center space-x-1 mt-1">
              <InformationCircleIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-400 text-sm">{service.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-1">
        <div className="flex items-center space-x-1 mt-1">
          <ClockIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-gray-400 text-sm">{formattedDuration}</p>
        </div>

        <Button
          className="mt-3 w-full"
          variant={isSelected ? "primary" : "secondary"}
          size="sm"
          icon={
            isSelected ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )
          }
        >
          {isSelected ? "Seleccionado" : "Seleccionar"}
        </Button>
      </div>
    </div>
  );
}
