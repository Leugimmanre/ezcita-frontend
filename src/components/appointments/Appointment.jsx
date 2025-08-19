// src/components/servicesComponents/Appointment.jsx
import { MAX_SERVICES_SELECTION } from "@/data/index";
import { useAppointment } from "@/hooks/useAppointment";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { registerLocale } from "react-datepicker";
import { generateTimeSlots } from "@/utils/generateTimeSlots";
import { useAppointmentContext } from "@/contexts/useAppointmentContext";
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/services/servicesAPI";
import { toast } from "react-toastify";

// Registrar el locale en español
registerLocale("es", es);

export default function Appointment({
  onBack = () => {},
  onConfirm = () => {},
  isEditing = false, // Modo edición
  appointmentToEdit = null, // Cita existente para editar
  startHour = 9,
  endHour = 18,
  interval = 30,
  lunchStart = 13,
  lunchEnd = 15,
  maxMonthsAhead = 1,
  workingDays = [1, 2, 3, 4, 5],
  appointments = [],
}) {
  const availableHours = generateTimeSlots(startHour, endHour, interval);
  const { selectedServices, setSelectedServices } = useAppointment();
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour;
  });
  const { staffCount } = useAppointmentContext();

  // Traemos todos los servicios desde el backend
  const { data: allServices = [] } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  // Habilitar guardar solo si hay hora y al menos 1 servicio
  const canConfirm = Boolean(selectedTime) && selectedServices.length > 0;
  const noServices = selectedServices.length === 0;

  // Inicializar con datos de la cita a editar
  useEffect(() => {
    if (isEditing && appointmentToEdit) {
      // Prellenar servicios
      setSelectedServices(appointmentToEdit.services);

      // Prellenar fecha y hora
      const appointmentDate = new Date(appointmentToEdit.date);
      setSelectedDate(appointmentDate);

      // Formatear hora
      const timeString = appointmentDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setSelectedTime(timeString);
    }
  }, [isEditing, appointmentToEdit, setSelectedServices]);

  // Calcular totales
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );
  const maxServices = MAX_SERVICES_SELECTION;

  // Manejo de servicios
  const handleRemoveService = (serviceId) => {
    // Permite dejar la cita sin servicios en edición
    setSelectedServices((prev) => prev.filter((s) => s._id !== serviceId));
  };

  const handleAddService = (e) => {
    const serviceId = e.target.value;
    if (!serviceId) return;

    // Comprobamos límite
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

  const handleClearSelection = () => {
    setSelectedServices([]);
  };

  // Confirmar (edición o creación) enviando todo lo necesario
  const handleConfirm = () => {
    if (!canConfirm) return;
    const [hour, minute] = selectedTime.split(":").map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hour, minute, 0, 0);

    if (isEditing) {
      // Modo EDICIÓN: el padre espera objeto
      onConfirm({
        date: finalDate,
        services: selectedServices.map((s) => s._id),
        duration: totalDuration,
      });
    } else {
      // Modo CREACIÓN: retrocompatible con handlers antiguos (Date)
      onConfirm(finalDate);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  // Clases reutilizables
  const serviceItemClasses =
    "flex justify-between items-center p-3 bg-blue-800/30 rounded-lg border border-blue-700/50";
  const priceTextClasses = "text-lg font-bold text-blue-300";
  const durationTextClasses = "text-sm text-blue-200";
  const datePickerClasses =
    "w-full p-2 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  // Títulos según modo
  const headerTitle = isEditing ? "Editar Cita" : "Detalle de Cita y Resumen";
  const headerDescription = isEditing
    ? "Modifica los detalles de tu cita"
    : "Verifica la información y confirma tu cita";
  const confirmButtonText = isEditing ? "Guardar Cambios" : "Confirmar cita";

  return (
    <div className="mt-10 max-w-6xl mx-auto">
      {/* Encabezado */}
      <header className="text-center sm:text-left mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3">
          {headerTitle}
        </h1>
        <p className="text-lg text-white">{headerDescription}</p>
      </header>

      {/* Botón para volver */}
      <nav className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-400 hover:text-blue-300"
          aria-label="Volver a selección de servicios"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
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

      {/* --- CONTENIDO PRINCIPAL --- */}
      {/* En edición: mantenemos la misma tarjeta aunque no haya servicios.
          En creación: si no hay servicios, mostramos el vacío clásico. */}
      {isEditing || selectedServices.length > 0 ? (
        <section className="mt-8 p-5 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl border border-blue-700/50">
          {/* Encabezado de la sección + selector para añadir */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              Servicios seleccionados ({selectedServices.length}/{maxServices})
            </h2>

            {/* En edición siempre mostramos el selector para añadir, incluso si no hay servicios */}
            {isEditing && (
              <div className="mb-5">
                <label className="block text-white font-medium mb-2">
                  Añadir otro servicio:
                </label>
                <div className="relative">
                  <select
                    onChange={handleAddService}
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-700/80 text-white border border-blue-600/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all hover:bg-gray-700"
                  >
                    <option value="">-- Selecciona un servicio --</option>
                    {allServices.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} - {service.price}€
                      </option>
                    ))}
                  </select>
                  {/* Iconos decorativos (dejados como comentario para conservar estructura) */}
                  {/* … (iconos a izquierda/derecha como ya tienes) … */}
                </div>
                <p className="mt-1 text-sm text-blue-300">
                  Puedes añadir hasta {maxServices - selectedServices.length}{" "}
                  servicios más
                </p>
              </div>
            )}

            {/* En creación, mantenemos el botón de limpiar como estaba */}
            {!isEditing && (
              <button
                onClick={handleClearSelection}
                className="text-sm flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition cursor-pointer"
                aria-label="Limpiar selección"
              >
                {/* …icono… */}
                Limpiar
              </button>
            )}
          </div>

          {/* Lista de servicios o aviso en edición si está vacío */}
          {selectedServices.length > 0 ? (
            <div className="space-y-3" role="list">
              {selectedServices.map((service) => (
                <div
                  key={service._id}
                  className={serviceItemClasses}
                  role="listitem"
                >
                  <div>
                    <p className="font-medium text-white">{service.name}</p>
                    <p className={durationTextClasses}>
                      {service.duration} min.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={priceTextClasses}>{service.price}€</p>
                    <button
                      onClick={() => handleRemoveService(service._id)}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                      aria-label={`Eliminar ${service.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
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
            // En edición, mantenernos en la tarjeta con instrucción clara
            isEditing && (
              <div className="p-4 rounded-lg bg-blue-900/30 border border-blue-700/50">
                <p className="text-blue-200">
                  Esta cita no tiene servicios. Usa el selector de arriba para
                  añadir al menos uno.
                </p>
              </div>
            )
          )}

          {/* Totales (se muestran incluso con 0 para mantener consistencia visual) */}
          <div className="mt-5 pt-4 border-t border-blue-700/50 flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-300">Duración total:</p>
              <p className="text-lg font-bold text-white">
                {totalDuration} min.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-300">Precio total:</p>
              <p className="text-2xl font-bold text-white">{totalPrice}€</p>
            </div>
          </div>

          {/* Selección de fecha y hora */}
          <div className="mt-6 space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-white font-medium mb-3">
                Selecciona fecha y hora:
              </h3>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                locale="es"
                dateFormat="dd/MM/yyyy"
                className={datePickerClasses}
                placeholderText="Selecciona fecha y hora"
                filterDate={(date) => {
                  const oneMonthLater = new Date();
                  oneMonthLater.setMonth(
                    oneMonthLater.getMonth() + maxMonthsAhead
                  );
                  const dayOfWeek = date.getDay();
                  return (
                    date <= oneMonthLater && workingDays.includes(dayOfWeek)
                  );
                }}
              />

              {selectedDate && (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mt-6">
                  {availableHours.map((hour) => {
                    const [hourPart, minutePart] = hour.split(":").map(Number);
                    const dateWithTime = new Date(selectedDate);
                    dateWithTime.setHours(hourPart, minutePart, 0, 0);

                    const now = new Date();

                    // Calcular hora de fin de la cita seleccionada (en base a duración total)
                    const selectedEnd = new Date(dateWithTime);
                    selectedEnd.setMinutes(
                      selectedEnd.getMinutes() + totalDuration
                    );

                    // Contar cuántas citas se solapan (ignorando la propia cita en edición)
                    const overlappingCount = appointments?.filter((appt) => {
                      if (!["pending", "confirmed"].includes(appt.status))
                        return false;
                      if (appt._id === appointmentToEdit?._id) return false;

                      const apptStart = new Date(appt.date);
                      const apptEnd = new Date(apptStart);
                      apptEnd.setMinutes(apptEnd.getMinutes() + appt.duration);

                      return apptStart < selectedEnd && apptEnd > dateWithTime;
                    }).length;

                    // Está bloqueado si el número de solapamientos >= trabajadores
                    const isBooked = overlappingCount >= staffCount;

                    const isWorkingDay = workingDays.includes(
                      selectedDate.getDay()
                    );

                    // Deshabilitar si:
                    // - No hay servicios (en edición mantenemos la vista pero bloqueamos horas)
                    // - Hora pasada
                    // - Bloqueos por solape
                    // - Franja de comida
                    // - Día no laborable
                    const disabled =
                      noServices ||
                      dateWithTime < now ||
                      isBooked ||
                      (dateWithTime.getHours() +
                        dateWithTime.getMinutes() / 60 >=
                        lunchStart &&
                        dateWithTime.getHours() +
                          dateWithTime.getMinutes() / 60 <
                          lunchEnd) ||
                      !isWorkingDay;

                    return (
                      <button
                        key={hour}
                        onClick={() => setSelectedTime(hour)}
                        disabled={disabled}
                        className={`text-center text-sm font-bold p-2 rounded-lg transition ${
                          selectedTime === hour
                            ? "bg-blue-500 text-white ring-2 ring-blue-300"
                            : "bg-white text-blue-800"
                        } ${
                          disabled
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-blue-100"
                        }`}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Mensaje de ayuda si no hay servicios */}
              {noServices && (
                <p className="mt-2 text-sm text-blue-300">
                  Añade al menos un servicio para habilitar la selección de
                  hora.
                </p>
              )}
            </div>

            {/* Información de fecha y hora seleccionada */}
            {selectedTime && (
              <div className="bg-blue-900/30 p-3 rounded-lg">
                <p className="text-white">
                  <span className="font-semibold">Fecha seleccionada:</span>{" "}
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  a las <span className="font-semibold">{selectedTime}</span>
                </p>
              </div>
            )}

            {/* Botón final (deshabilitado si no hay servicios u hora) */}
            <button
              className={`w-full py-3 text-white font-bold rounded-lg transition-all shadow-lg cursor-pointer uppercase ${
                canConfirm
                  ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
                  : "bg-gray-500 opacity-50 cursor-not-allowed"
              }`}
              onClick={handleConfirm}
              aria-label={confirmButtonText}
              disabled={!canConfirm}
            >
              {confirmButtonText}
            </button>
          </div>
        </section>
      ) : (
        // Estado vacío SOLO en creación (en edición no salimos de la tarjeta)
        <section className="mt-8 p-6 bg-blue-900/30 rounded-xl border border-blue-700/50 text-center">
          <div className="text-blue-300 mb-3" aria-hidden="true">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a1 1 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            No has seleccionado servicios aún
          </h2>
          <p className="text-blue-200">
            Por favor, selecciona hasta {maxServices} servicios para continuar
            con tu reserva
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            aria-label="Seleccionar servicios"
          >
            Seleccionar servicios
          </button>
        </section>
      )}
    </div>
  );
}
