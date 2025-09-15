// src/components/appointments/Appointment.jsx
import { MAX_SERVICES_SELECTION } from "@/data/index";
import { useAppointment } from "@/hooks/useAppointment";
import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { registerLocale } from "react-datepicker";
// NUEVO: solo utils avanzados
import {
  generateSlotsFromDayBlocks,
  fitsAnyDayBlock,
} from "@/utils/generateDaySlots";
import { useAppointmentContext } from "@/contexts/useAppointmentContext";
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/services/servicesAPI";
import { toast } from "react-toastify";
import { useAvailability } from "@/hooks/useAvailability";

registerLocale("es", es);

export default function Appointment({
  onBack = () => {},
  onConfirm = () => {},
  isEditing = false,
  appointmentToEdit = null,
  // NUEVO: solo avanzado
  interval = 30,
  maxMonthsAhead = 1,
  appointments = [],
  dayBlocks = null,
  closedDates = [],
  timezone = "Europe/Madrid",
  staffCount: staffCountProp,
}) {
  const { selectedServices, setSelectedServices } = useAppointment();
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour;
  });
  const { staffCount: ctxStaffCount } = useAppointmentContext();
  const capacity = Number(staffCountProp ?? ctxStaffCount ?? 1); // NUEVO

  const { data: allServices = [] } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  const canConfirm = Boolean(selectedTime) && selectedServices.length > 0;
  const noServices = selectedServices.length === 0;

  useEffect(() => {
    if (isEditing && appointmentToEdit) {
      setSelectedServices(appointmentToEdit.services);
      const appointmentDate = new Date(appointmentToEdit.date);
      setSelectedDate(appointmentDate);
      const timeString = appointmentDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone,
      });
      setSelectedTime(timeString);
    }
  }, [isEditing, appointmentToEdit, setSelectedServices, timezone]);

  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + Number(s.price ?? 0),
    0
  );

  const toMinutes = (duration, unit) => {
    const n = Number(duration);
    if (Number.isNaN(n)) return 0;
    return (unit ?? "").toLowerCase() === "horas"
      ? Math.round(n * 60)
      : Math.round(n);
  };

  const formatServiceDuration = (duration, unit) => {
    const total = toMinutes(duration, unit);
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  };

  const formatTotalMinutes = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  };

  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + toMinutes(s.duration, s.durationUnit),
    0
  );
  const maxServices = MAX_SERVICES_SELECTION;

  const advancedMode = !!dayBlocks;

  const availableHours = useMemo(() => {
    if (!selectedDate) return [];
    if (!advancedMode) return [];
    return generateSlotsFromDayBlocks(selectedDate, { dayBlocks, interval });
  }, [advancedMode, selectedDate, dayBlocks, interval]);

  const excludeId = isEditing ? appointmentToEdit?._id : undefined;
  const { data: busy = [], isLoading: loadingBusy } = useAvailability(
    selectedDate,
    excludeId
  );

  const handleRemoveService = (serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s._id !== serviceId));
  };

  const handleAddService = (e) => {
    const serviceId = e.target.value;
    if (!serviceId) return;
    if (selectedServices.length >= maxServices) {
      toast.warning(`Solo puedes seleccionar hasta ${maxServices} servicios.`);
      e.target.value = "";
      return;
    }
    const service = allServices.find((s) => s._id === serviceId);
    if (service && !selectedServices.some((s) => s._id === service._id)) {
      setSelectedServices((prev) => [...prev, service]);
    }
    e.target.value = "";
  };

  const handleClearSelection = () => setSelectedServices([]);

  const handleConfirm = () => {
    if (!canConfirm) return;
    const [hour, minute] = selectedTime.split(":").map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hour, minute, 0, 0);
    const finalEnd = new Date(finalDate);
    finalEnd.setMinutes(finalEnd.getMinutes() + totalDuration);

    const overlaps =
      appointments?.filter((appt) => {
        if (!["pending", "confirmed"].includes(appt.status)) return false;
        if (appt._id === appointmentToEdit?._id) return false;
        const apptStart = new Date(appt.date);
        const apptEnd = new Date(apptStart);
        apptEnd.setMinutes(apptEnd.getMinutes() + appt.duration);
        return apptStart < finalEnd && apptEnd > finalDate;
      }).length || 0;

    if (overlaps >= capacity) {
      toast.error(
        "No hay personal disponible para esa franja horaria. Elige otra hora."
      );
      return;
    }
    onConfirm({
      date: finalDate,
      services: selectedServices.map((s) => s._id),
      duration: totalDuration,
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const DOW_KEYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const isClosedDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return closedDates.includes(`${y}-${m}-${d}`);
  };

  return (
    <div className="mt-10 max-w-6xl mx-auto">
      <header className="text-center sm:text-left mb-10">
        <h1 className="text-4xl font-extrabold text-[var(--color-text)] dark:text-white mb-3">
          {isEditing ? "Editar Cita" : "Detalle de Cita y Resumen"}
        </h1>
        <p className="text-lg text-[var(--color-text)]/80 dark:text-white">
          {isEditing
            ? "Modifica los detalles de tu cita"
            : "Verifica la información y confirma tu cita"}
        </p>
      </header>

      <nav className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] dark:text-blue-400 dark:hover:text-blue-300"
          aria-label="Volver a selección de servicios"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Volver a selección de servicios
        </button>
      </nav>

      {isEditing || selectedServices.length > 0 ? (
        <section
          className={
            "mt-8 p-5 rounded-xl border " +
            "bg-[var(--color-secondary)] border-[var(--color-secondary-light)] " +
            "dark:bg-gradient-to-r dark:from-blue-900/50 dark:to-indigo-900/50 dark:border-blue-700/50"
          }
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--color-text)] dark:text-white">
              Servicios seleccionados ({selectedServices.length}/
              {MAX_SERVICES_SELECTION})
            </h2>

            {isEditing && (
              <div className="mb-5">
                <label className="block text-[var(--color-text)] dark:text-white font-medium mb-2">
                  Añadir otro servicio:
                </label>
                <div className="relative">
                  <select
                    onChange={handleAddService}
                    className={
                      "w-full pl-3 pr-3 py-3 rounded-lg border appearance-none transition-all " +
                      "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-secondary-light)] " +
                      "focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent " +
                      "dark:bg-gray-700/80 dark:text-white dark:border-blue-600/50 dark:focus:ring-blue-500 dark:hover:bg-gray-700"
                    }
                  >
                    <option value="">-- Selecciona un servicio --</option>
                    {allServices.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} - {service.price}€
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)] dark:text-blue-300">
                  Puedes añadir hasta{" "}
                  {MAX_SERVICES_SELECTION - selectedServices.length} servicios
                  más
                </p>
              </div>
            )}

            {!isEditing && (
              <button
                onClick={handleClearSelection}
                className={
                  "text-sm flex items-center px-3 py-1.5 rounded transition " +
                  "bg-[var(--color-secondary-light)] hover:bg-[var(--color-secondary)] text-[var(--color-text)] " +
                  "dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                }
                aria-label="Limpiar selección"
              >
                Limpiar
              </button>
            )}
          </div>

          {selectedServices.length > 0 ? (
            <div className="space-y-3" role="list">
              {selectedServices.map((service) => (
                <div
                  key={service._id}
                  className={
                    "flex justify-between items-center p-3 rounded-lg border " +
                    "bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-secondary)_92%)] " +
                    "border-[color-mix(in_oklab,var(--color-primary)_35%,var(--color-secondary-light)_65%)] " +
                    "dark:bg-blue-800/30 dark:border-blue-700/50"
                  }
                  role="listitem"
                >
                  <div>
                    <p className="font-medium text-[var(--color-text)] dark:text-white">
                      {service.name}
                    </p>
                    <p className="text-sm text-[var(--color-muted)] dark:text-blue-200">
                      {formatServiceDuration(
                        service.duration,
                        service.durationUnit
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-[var(--color-primary)] dark:text-blue-300">
                      {service.price}€
                    </p>
                    <button
                      onClick={() => handleRemoveService(service._id)}
                      className="text-[var(--color-danger)] hover:text-[var(--color-danger-hover)] dark:text-red-400 dark:hover:text-red-300"
                      aria-label={`Eliminar ${service.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            isEditing && (
              <div
                className={
                  "p-4 rounded-lg " +
                  "bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-secondary)_92%)] " +
                  "border border-[color-mix(in_oklab,var(--color-primary)_35%,var(--color-secondary-light)_65%)] " +
                  "text-[var(--color-text)] " +
                  "dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-200"
                }
              >
                Esta cita no tiene servicios. Usa el selector de arriba para
                añadir al menos uno.
              </div>
            )
          )}

          <div className="mt-5 pt-4 flex justify-between items-center border border-t-0 border-[var(--color-secondary-light)] dark:border-blue-700/50">
            <div>
              <p className="text-sm text-[var(--color-muted)] dark:text-blue-300">
                Duración total:
              </p>
              <p className="text-lg font-bold text-[var(--color-text)] dark:text-white">
                {formatTotalMinutes(totalDuration)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--color-muted)] dark:text-blue-300">
                Precio total:
              </p>
              <p className="text-2xl font-bold text-[var(--color-text)] dark:text-white">
                {totalPrice}€
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div
              className={
                "rounded-lg border p-4 " +
                "bg-[var(--color-secondary)] border-[var(--color-secondary-light)] " +
                "dark:bg-gray-800/50 dark:border-gray-700"
              }
            >
              <h3 className="text-[var(--color-text)] dark:text-white font-medium mb-3">
                Selecciona fecha y hora:
              </h3>

              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                locale="es"
                dateFormat="dd/MM/yyyy"
                className={
                  "w-full p-2 rounded-lg border " +
                  "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-secondary-light)] " +
                  "focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent " +
                  "dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500"
                }
                placeholderText="Selecciona fecha y hora"
                // NUEVO: filtrado SOLO avanzado
                filterDate={(date) => {
                  const limit = new Date();
                  limit.setMonth(
                    limit.getMonth() + Number(maxMonthsAhead || 0)
                  );
                  const withinMonths = date <= limit;
                  if (!withinMonths) return false;
                  if (isClosedDate(date)) return false;
                  const key = DOW_KEYS[date.getDay()];
                  const blocks = Array.isArray(dayBlocks?.[key])
                    ? dayBlocks[key]
                    : [];
                  return blocks.length > 0;
                }}
              />

              {selectedDate && (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mt-6">
                  {availableHours.map((hour) => {
                    const [hourPart, minutePart] = hour.split(":").map(Number);
                    const dateWithTime = new Date(selectedDate);
                    dateWithTime.setHours(hourPart, minutePart, 0, 0);

                    const now = new Date();

                    const selectedEnd = new Date(dateWithTime);
                    selectedEnd.setMinutes(
                      selectedEnd.getMinutes() + totalDuration
                    );

                    const overlappingCount = busy.filter((b) => {
                      const apptStart = new Date(b.start);
                      const apptEnd = new Date(apptStart);
                      apptEnd.setMinutes(
                        apptEnd.getMinutes() + (b.duration || 0)
                      );
                      return apptStart < selectedEnd && apptEnd > dateWithTime;
                    }).length;

                    const isBooked = overlappingCount >= capacity;

                    let disabled;
                    const hhmm = `${String(hourPart).padStart(2, "0")}:${String(
                      minutePart
                    ).padStart(2, "0")}`;
                    const fitsBlock = fitsAnyDayBlock(
                      selectedDate,
                      hhmm,
                      totalDuration || interval,
                      { dayBlocks }
                    );
                    disabled =
                      noServices ||
                      dateWithTime < now ||
                      isBooked ||
                      !fitsBlock;

                    const slotBase =
                      "text-center text-sm font-bold p-2 rounded-lg transition";
                    const slotSelected =
                      "bg-[var(--color-primary)] text-white ring-2 ring-[color-mix(in_oklab,var(--color-primary)_55%,white_45%)] " +
                      "dark:bg-blue-500 dark:text-white dark:ring-2 dark:ring-blue-300";
                    const slotIdle =
                      "bg-[var(--color-secondary)] text-[var(--color-primary)] hover:bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-secondary)_92%)] " +
                      "dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700";
                    const slotDisabled = "opacity-30 cursor-not-allowed";

                    const classes =
                      slotBase +
                      " " +
                      (selectedTime === hour ? slotSelected : slotIdle) +
                      (disabled ? " " + slotDisabled : "");

                    return (
                      <button
                        key={hour}
                        onClick={() => {
                          if (disabled) {
                            toast.info(
                              isBooked
                                ? "Franja ocupada. Elige otra hora."
                                : "Hora no disponible."
                            );
                            return;
                          }
                          setSelectedTime(hour);
                        }}
                        className={
                          classes + (disabled ? " pointer-events-auto" : "")
                        }
                        aria-disabled={disabled}
                        title={isBooked ? "Franja ocupada" : undefined}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>
              )}

              {loadingBusy && (
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Cargando disponibilidad...
                </p>
              )}

              {noServices && (
                <p className="mt-2 text-sm text-[var(--color-muted)] dark:text-blue-300">
                  Añade al menos un servicio para habilitar la selección de
                  hora.
                </p>
              )}
            </div>

            {selectedTime && (
              <div
                className={
                  "p-3 rounded-lg " +
                  "bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-secondary)_92%)] text-[var(--color-text)] " +
                  "dark:bg-blue-900/30 dark:text-white"
                }
              >
                <p>
                  <span className="font-semibold">Fecha seleccionada:</span>{" "}
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: timezone,
                  })}{" "}
                  a las <span className="font-semibold">{selectedTime}</span>
                </p>
              </div>
            )}

            <button
              className={
                "w-full py-3 font-bold rounded-lg transition-all shadow-lg cursor-pointer uppercase " +
                (canConfirm
                  ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
                  : "bg-gray-500 opacity-50 cursor-not-allowed text-white")
              }
              onClick={handleConfirm}
              aria-label={isEditing ? "Guardar Cambios" : "Confirmar cita"}
              disabled={!canConfirm}
            >
              {isEditing ? "Guardar Cambios" : "Confirmar cita"}
            </button>
          </div>
        </section>
      ) : (
        <section
          className={
            "mt-8 p-6 rounded-xl border text-center " +
            "bg-[var(--color-secondary)] border-[var(--color-secondary-light)] text-[var(--color-text)] " +
            "dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-200"
          }
        >
          <div
            className="mb-3 text-[var(--color-primary)] dark:text-blue-300"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a1 1 0 100-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)] dark:text-white mb-2">
            No has seleccionado servicios aún
          </h2>
          <p className="text-[var(--color-muted)] dark:text-blue-200">
            Por favor, selecciona hasta {MAX_SERVICES_SELECTION} servicios para
            continuar con tu reserva
          </p>
          <button
            onClick={onBack}
            className={
              "mt-4 px-4 py-2 rounded-lg transition font-medium " +
              "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] " +
              "dark:bg-blue-600 dark:hover:bg-blue-700"
            }
            aria-label="Seleccionar servicios"
          >
            Seleccionar servicios
          </button>
        </section>
      )}
    </div>
  );
}
