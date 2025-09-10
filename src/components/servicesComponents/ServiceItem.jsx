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
  const base = "p-5 rounded-xl transition-all cursor-pointer border";
  const disabled =
    isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "";

  // Seleccionado
  // - Claro: tinte suave del primario + borde primario con variables
  // - Oscuro: tu clase original
  const selected =
    "bg-[color-mix(in_oklab,var(--color-primary)_12%,var(--color-secondary)_88%)] " +
    "border-[var(--color-primary)] " +
    "dark:bg-blue-500/10 dark:border-blue-500";

  //  No seleccionado
  // - Claro: tus tokens exactos
  // - Oscuro: tu look original
  const notSelected =
    "bg-[var(--color-secondary)] border-[var(--color-secondary-light)] " +
    "hover:border-[var(--color-primary)] " +
    "dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-500";

  const card = [base, isSelected ? selected : notSelected, disabled].join(" ");

  return (
    <div
      className={card}
      onClick={() => !isDisabled && onSelect(service)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === "Enter" || e.key === " "))
          onSelect(service);
      }}
    >
      <div className="flex justify-between items-start">
        <div className="w-full">
          <div className="flex justify-between items-start">
            <div>
              {/* Título: claro (token) / oscuro (blanco) */}
              <h3 className="font-semibold text-lg text-[var(--color-text)] dark:text-white">
                {service.name}
              </h3>

              {/* Imagen */}
              {service.images?.length > 0 && (
                <div
                  className="mb-3 rounded-lg overflow-hidden border flex justify-center items-center h-48
                                bg-[var(--color-bg)] border-[var(--color-secondary-light)]
                                dark:bg-gray-900 dark:border-gray-700"
                >
                  <img
                    src={service.images[0].url}
                    alt={service.images[0].alt || service.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder-service.jpg";
                      e.currentTarget.className = "w-full h-48 object-cover";
                    }}
                  />
                </div>
              )}

              {/* Categoría */}
              <div className="flex items-center space-x-1 mt-1">
                <TagIcon className="h-4 w-4 text-[var(--color-muted)] dark:text-gray-400" />
                <p className="text-sm text-[var(--color-muted)] dark:text-gray-400 mt-0 capitalize">
                  {service.category}
                </p>
              </div>
            </div>

            {/* Precio */}
            <span className="text-lg font-bold text-[var(--color-primary)] dark:text-blue-300">
              {formattedPrice}
            </span>
          </div>

          {/* Descripción */}
          {service.description && (
            <div className="flex items-center space-x-1 mt-1">
              <InformationCircleIcon className="h-4 w-4 text-[var(--color-muted)] dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-[var(--color-muted)] dark:text-gray-400 text-sm">
                {service.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-1">
        <div className="flex items-center space-x-1 mt-1">
          <ClockIcon className="h-4 w-4 text-[var(--color-muted)] dark:text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-[var(--color-muted)] dark:text-gray-400 text-sm">
            {formattedDuration}
          </p>
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
