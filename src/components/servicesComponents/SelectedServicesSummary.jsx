// src/components/servicesComponents/SelectedServicesSummary.jsx
import React from "react";
import Button from "@/components/ui/Button";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SelectedServicesSummary({
  selectedServices = [],
  onRemove = () => {},
  onClear = () => {},
  onContinue = () => {},
  formatCurrency,
  formatDuration,
}) {
  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );
  const totalDuration = selectedServices.reduce(
    (sum, service) => sum + service.duration,
    0
  );

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Servicios seleccionados
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={onClear}
          icon={<XMarkIcon className="h-4 w-4" />}
        >
          Limpiar todo
        </Button>
      </div>

      <ul className="divide-y divide-gray-700">
        {selectedServices.map((service) => (
          <li
            key={service._id}
            className="py-3 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-white">{service.name}</p>
              <p className="text-sm text-gray-400">
                {formatCurrency(service.price)} •{" "}
                {formatDuration(service.duration, service.durationUnit)}
              </p>
            </div>
            <Button
              variant="danger-outline"
              size="xs"
              onClick={() => onRemove(service._id)}
              icon={<TrashIcon className="h-4 w-4" />}
            >
              Eliminar
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-5 border-t border-gray-700">
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Total:</span>
          <span className="font-semibold text-xl text-white">
            {formatCurrency(totalPrice)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mb-6">
          <span>Duración total:</span>
          <span>{formatDuration(totalDuration, "min.")}</span>
        </div>

        <Button
          variant="primary"
          className="w-full py-3"
          onClick={onContinue}
          disabled={selectedServices.length === 0}
        >
          Continuar con la reserva
        </Button>
      </div>
    </div>
  );
}
