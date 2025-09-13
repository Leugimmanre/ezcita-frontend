// src/components/settingsComponents/SettingsServicesList.jsx
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/services/servicesAPI";
import { MAX_SERVICES_SELECTION } from "@/data/index";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "@/hooks/useAppointment";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { formatCurrency } from "@/helpers/helpers";
import ServiceItem from "../servicesComponents/ServiceItem";
import SelectedServicesSummary from "../servicesComponents/SelectedServicesSummary";

export default function SettingsServicesList() {
  const navigate = useNavigate();
  const { selectedServices, setSelectedServices } = useAppointment();

  const [selectionError, setSelectionError] = useState("");
  const maxServices = MAX_SERVICES_SELECTION;
  const errorTimeoutRef = useRef(null);

  // Limpieza de timeout al desmontar
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Consulta de servicios
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const services = data || [];

  // Validación de selección máxima
  useEffect(() => {
    if (selectedServices.length > maxServices) {
      setSelectionError(
        `Solo puedes seleccionar un máximo de ${maxServices} servicios por cita`
      );
      setSelectedServices((prev) => prev.slice(0, maxServices));
    }
  }, [selectedServices, maxServices, setSelectedServices]);

  // Manejo de selección de servicios
  const handleServiceSelect = (service) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      setSelectionError("");
    }

    // Deseleccionar si ya está seleccionado
    if (selectedServices.some((s) => s._id === service._id)) {
      setSelectedServices((prev) => prev.filter((s) => s._id !== service._id));
      return;
    }

    // Validar límite máximo
    if (selectedServices.length >= maxServices) {
      setSelectionError(
        `Has alcanzado el límite máximo (${maxServices} servicios)`
      );
      errorTimeoutRef.current = setTimeout(() => setSelectionError(""), 3000);
      return;
    }

    // Agregar nuevo servicio
    setSelectedServices((prev) => [...prev, service]);
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedServices([]);
    setSelectionError("");
  };

  // Remover servicio específico
  const onRemoveService = (serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s._id !== serviceId));
  };

  // Formatear duración para mostrar
  const formatServiceDuration = (duration, unit) => {
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Selecciona tus servicios
        </h2>
        <p className="text-gray-600">
          Puedes seleccionar hasta {maxServices} servicios por cita
        </p>
      </div>

      {/* Contador de selección */}
      <div className="flex items-center justify-between mb-4 bg-blue-50 p-3 rounded-lg">
        <div className="font-medium text-blue-800">
          Seleccionados: {selectedServices.length}/{maxServices}
        </div>
        {selectedServices.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Limpiar selección
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {selectionError && (
        <div className="mb-4">
          <Alert type="error" message={selectionError} />
        </div>
      )}

      {/* Estados de carga/error */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} height={120} />
          ))}
        </div>
      )}

      {isError && (
        <Alert
          type="error"
          title="Error de conexión"
          message="No pudimos cargar los servicios. Por favor intenta nuevamente."
          actions={
            <Button
              variant="primary"
              onClick={refetch}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              Reintentar
            </Button>
          }
        />
      )}

      {/* Sin servicios disponibles */}
      {!isLoading && !isError && services.length === 0 && (
        <Alert
          type="warning"
          message="No hay servicios disponibles en este momento."
        />
      )}

      {/* Lista de servicios */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((service) => (
            <ServiceItem
              key={service._id}
              service={service}
              isSelected={selectedServices.some((s) => s._id === service._id)}
              isDisabled={
                !selectedServices.some((s) => s._id === service._id) &&
                selectedServices.length >= maxServices
              }
              onSelect={handleServiceSelect}
              formattedPrice={formatCurrency(service.price)}
              formattedDuration={formatServiceDuration(
                service.duration,
                service.durationUnit
              )}
            />
          ))}
        </div>
      )}

      {/* Resumen de selección */}
      {selectedServices.length > 0 && (
        <SelectedServicesSummary
          selectedServices={selectedServices}
          onRemove={onRemoveService}
          onClear={clearSelection}
          maxServices={maxServices}
          onContinue={() => navigate("/appointments/new/details")}
          formatCurrency={formatCurrency}
          formatDuration={formatServiceDuration}
        />
      )}
    </div>
  );
}
