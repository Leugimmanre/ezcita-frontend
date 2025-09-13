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
  const toNumber = (v) => {
    if (typeof v === "number") return v;
    const n = Number(
      String(v)
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    );
    return Number.isNaN(n) ? 0 : n;
  };
  const toMinutes = (d, u) => {
    const n = toNumber(d);
    return (u ?? "").toLowerCase() === "horas"
      ? Math.round(n * 60)
      : Math.round(n);
  };
  const formatTotalMinutes = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  };
  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + toNumber(s.price),
    0
  );
  const totalDurationMins = selectedServices.reduce(
    (sum, s) => sum + toMinutes(s.duration, s.durationUnit),
    0
  );

  // === Clases con temas (siguiendo el mismo patrón que MyAppointments) ===
  const containerClass =
    "mt-8 p-6 rounded-xl border " +
    // Tema claro
    "bg-[var(--color-secondary)] border-[var(--color-secondary-light)] " +
    // Tema oscuro
    "dark:bg-gradient-to-r dark:from-blue-900/50 dark:to-indigo-900/50 dark:border-blue-700/50";

  const titleClass =
    "text-lg font-semibold " + "text-[var(--color-text)] " + "dark:text-white";

  const serviceNameClass =
    "font-medium " + "text-[var(--color-text)] " + "dark:text-white";

  const serviceDetailsClass =
    "text-sm " + "text-[var(--color-muted)] " + "dark:text-blue-300";

  const totalLabelClass = "text-[var(--color-muted)] " + "dark:text-blue-300";

  const totalValueClass =
    "font-semibold text-xl " + "text-[var(--color-text)] " + "dark:text-white";

  const dividerClass =
    "border-t " +
    "border-[var(--color-secondary-light)] " +
    "dark:border-blue-700/30";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={titleClass}>Servicios seleccionados</h3>
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
              <p className={serviceNameClass}>{service.name}</p>
              <p className={serviceDetailsClass}>
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

      <div className={`mt-5 pt-5 ${dividerClass}`}>
        <div className="flex justify-between mb-2">
          <span className={totalLabelClass}>Total:</span>
          <span className={totalValueClass}>{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm mb-6">
          <span className={totalLabelClass}>Duración total:</span>
          <span className={totalLabelClass}>
            {formatTotalMinutes(totalDurationMins)}
          </span>
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
