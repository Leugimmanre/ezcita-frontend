// src/components/servicesComponents/ServicesList.jsx
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/services/servicesAPI";
import ServiceItem from "./ServiceItem";
import SelectedServicesSummary from "./SelectedServicesSummary";
import { MAX_SERVICES_SELECTION } from "@/data/index";
import { useNavigate } from "react-router-dom";
import { useAppointment } from "@/hooks/useAppointment";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { formatCurrency } from "@/helpers/helpers";

export default function ServicesList() {
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
        `Límite alcanzado: Máximo ${maxServices} servicios por cita`
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
      (unit ?? "").toLowerCase() === "horas"
        ? Number(duration) * 60
        : Number(duration);

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl lg:text-4xl font-extrabold text-current transition-colors">
          Selecciona tus servicios
        </h2>
        <p className="text-lg text-gray-600">
          Puedes seleccionar hasta {maxServices} servicios por cita
        </p>
      </div>

      {/* Contador de servicios seleccionados */}
      <div className="flex items-center justify-between mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mr-3 border-2 border-blue-200">
            <span className="text-blue-700 font-bold text-lg">
              {selectedServices.length}
            </span>
          </div>
          <div>
            <span className="font-semibold text-blue-800 block">
              Servicios seleccionados
            </span>
            <span className="text-blue-600 text-sm">
              {selectedServices.length} de {maxServices} servicios
            </span>
          </div>
        </div>

        {selectedServices.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Limpiar selección
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {selectionError && (
        <div className="mb-6 animate-fadeIn">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start shadow-sm">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800 font-medium">{selectionError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Estados de carga/error */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-red-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error de conexión
            </h3>
            <p className="text-red-600 mb-6">
              No pudimos cargar los servicios. Por favor intenta nuevamente.
            </p>
            <Button
              variant="primary"
              onClick={refetch}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
          </div>
        </div>
      )}

      {/* Sin servicios disponibles */}
      {!isLoading && !isError && services.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mb-8 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-yellow-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            No hay servicios disponibles
          </h3>
          <p className="text-yellow-600">
            No hay servicios disponibles en este momento.
          </p>
        </div>
      )}

      {/* Lista de servicios */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
