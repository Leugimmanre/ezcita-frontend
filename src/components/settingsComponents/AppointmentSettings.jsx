import { useEffect, useState } from "react";
import { generateTimeSlots } from "@/utils/generateTimeSlots";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";
import { toast } from "react-toastify";
import { daysOfWeek } from "@/data/index";
import SettingsStaff from "./SettingsStaff";
import { useAppointmentContext } from "@/contexts/useAppointmentContext";

export default function AppointmentSettings() {
  const {
    data: settings,
    isLoading,
    isSaving,
    saveSettings,
  } = useAppointmentSettings();

  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(18);
  const [interval, setInterval] = useState(15);
  const [lunchStart, setLunchStart] = useState(13);
  const [lunchEnd, setLunchEnd] = useState(15);
  const [maxMonthsAhead, setMaxMonthsAhead] = useState(1);
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]);
  const { staffCount } = useAppointmentContext();

  // Guardar configuración al cambiar
  useEffect(() => {
    if (settings) {
      setStartHour(settings.startHour);
      setEndHour(settings.endHour);
      setInterval(settings.interval);
      setLunchStart(settings.lunchStart);
      setLunchEnd(settings.lunchEnd);
      setMaxMonthsAhead(settings.maxMonthsAhead);
      setWorkingDays(settings.workingDays || [1, 2, 3, 4, 5]);
    }
  }, [settings]);

  // Alternar día de trabajo
  const toggleWorkingDay = (dayId) => {
    setWorkingDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const availableHours = generateTimeSlots(startHour, endHour, interval);

  const handleSave = () => {
    saveSettings(
      {
        startHour,
        endHour,
        interval,
        lunchStart,
        lunchEnd,
        maxMonthsAhead,
        workingDays,
        staffCount,
      },
      {
        onSuccess: () => toast.success("Configuración guardada"),
        onError: () => toast.error("Error al guardar"),
      }
    );
  };

  if (isLoading)
    return <p className="text-gray-700">Cargando configuración...</p>;

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Configuración de Horarios
        </h2>
      </div>

      {/* Sección de días de trabajo */}
      <div className="space-y-4 mb-4">
        <label className="block text-lg font-medium text-gray-700">
          Días de trabajo
        </label>
        <p className="text-sm text-gray-500">
          Selecciona los días en que tu negocio está abierto
        </p>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleWorkingDay(day.id)}
              className={`px-3 py-2 text-sm rounded-md ${
                workingDays.includes(day.id)
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-lg font-medium text-gray-700 mb-4">
        Otros ajustes
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hora de inicio
          </label>
          <input
            type="number"
            step="0.5"
            value={startHour}
            onChange={(e) => setStartHour(parseFloat(e.target.value))}
            min={0}
            max={23.5}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hora de fin
          </label>
          <input
            type="number"
            step="0.5"
            value={endHour}
            onChange={(e) => setEndHour(parseFloat(e.target.value))}
            min={0}
            max={23.5}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Intervalo (minutos)
          </label>
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(parseFloat(e.target.value))}
            step="0.5"
            min={15}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Inicio comida
          </label>
          <input
            type="number"
            step="0.5"
            value={lunchStart}
            onChange={(e) => setLunchStart(parseFloat(e.target.value))}
            min={0}
            max={23.5}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fin comida
          </label>
          <input
            type="number"
            step="0.5"
            value={lunchEnd}
            onChange={(e) => setLunchEnd(parseFloat(e.target.value))}
            min={0}
            max={23.5}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Reservas permitidas (meses)
          </label>
          <input
            type="number"
            value={maxMonthsAhead}
            onChange={(e) => setMaxMonthsAhead(parseInt(e.target.value))}
            min={1}
            max={24}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800"
          />
        </div>
      </div>

      {/* Sección de horarios disponibles */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Horarios disponibles
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {availableHours.map((h) => (
            <span
              key={h}
              className="text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 p-2 rounded text-center transition-colors cursor-default"
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Componente para configuración de personal */}
      <SettingsStaff />

      {/* Botón de guardar */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors font-bold cursor-pointer uppercase"
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Guardando...
            </span>
          ) : (
            "Guardar configuración"
          )}
        </button>
      </div>
    </div>
  );
}
