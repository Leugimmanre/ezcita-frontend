// src/components/settingsComponents/AppointmentSettings.jsx
import { useEffect, useState, useMemo } from "react";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";
import { toast } from "react-toastify";
import { useAppointmentContext } from "@/contexts/useAppointmentContext";
import DayBlocksEditor from "./DayBlocksEditor";
import { generateSlotsFromDayBlocks } from "@/utils/generateDaySlots";

export default function AppointmentSettings() {
  const {
    data: settings,
    isLoading,
    isSaving,
    saveSettings,
  } = useAppointmentSettings();

  // Solo avanzado
  const [interval, setInterval] = useState(30);
  const [maxMonthsAhead, setMaxMonthsAhead] = useState(2);
  const [timezone, setTimezone] = useState("Europe/Madrid");
  const [closedDates, setClosedDates] = useState([]);
  const { staffCount } = useAppointmentContext();

  const [dayBlocks, setDayBlocks] = useState(null);

  useEffect(() => {
    if (settings) {
      setInterval(settings.interval);
      setMaxMonthsAhead(settings.maxMonthsAhead);
      setTimezone(settings.timezone || "Europe/Madrid");
      setClosedDates(
        Array.isArray(settings.closedDates) ? settings.closedDates : []
      );
      setDayBlocks(settings.dayBlocks || null);
    }
  }, [settings]);

  // Preview
  const previewDate = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = (1 - day + 7) % 7 || 7; // siguiente lunes
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const previewSlots = useMemo(() => {
    return dayBlocks
      ? generateSlotsFromDayBlocks(previewDate, { dayBlocks, interval })
      : [];
  }, [dayBlocks, previewDate, interval]);

  const handleSave = () => {
    const payload = {
      dayBlocks,
      interval,
      maxMonthsAhead,
      staffCount,
      timezone,
      closedDates,
    };

    saveSettings(payload, {
      onSuccess: () => toast.success("Configuración guardada"),
      onError: (e) =>
        toast.error(e?.response?.data?.message || "Error al guardar"),
    });
  };

  if (isLoading)
    return <p className="text-gray-700">Cargando configuración...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Configuración de Horarios
        </h2>
      </div>

      {/* Editor de bloques por día (modo avanzado) */}
      <div className="mb-8">
        <label className="block text-lg font-medium text-gray-700">
          Bloques por día
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Configura los intervalos horarios para cada día de la semana. Los días
          sin bloques quedarán cerrados.
        </p>
        <DayBlocksEditor
          value={dayBlocks}
          onChange={setDayBlocks}
          interval={interval}
        />
      </div>

      {/* Otros ajustes avanzados */}
      <label className="block text-lg font-medium text-gray-700 mb-4">
        Otros ajustes
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Intervalo (minutos)
          </label>
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(parseFloat(e.target.value))}
            min={5}
            max={240}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Zona horaria
          </label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800"
            placeholder="Europe/Madrid"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fechas cerradas (YYYY-MM-DD, separadas por coma)
          </label>
          <input
            type="text"
            value={closedDates.join(",")}
            onChange={(e) =>
              setClosedDates(
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
              )
            }
            className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800"
            placeholder="2025-12-25,2026-01-01"
          />
        </div>
      </div>

      {/* Previsualización */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Horarios disponibles (preview)
        </h3>
        {previewSlots.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay bloques configurados para el día de ejemplo.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {previewSlots.map((h) => (
              <span
                key={h}
                className="text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 p-2 rounded text-center transition-colors cursor-default"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Guardar */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors font-bold cursor-pointer uppercase"
        >
          {isSaving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
