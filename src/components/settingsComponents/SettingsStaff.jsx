// src/components/settingsComponents/SettingsStaff.jsx
import { useAppointmentContext } from "@/contexts/useAppointmentContext";
import { useState } from "react";
import { toast } from "react-toastify";

export default function SettingsStaff() {
  const { staffCount, setStaffCount, saveStaffSettings } =
    useAppointmentContext();

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setStaffCount(value);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveStaffSettings(staffCount);
    setIsSaving(false);

    if (success) {
      toast.success("Número de trabajadores actualizado correctamente", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      toast.error("Error al guardar el número de trabajadores", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="mt-10 bg-white shadow-md rounded-xl border border-gray-200 p-6">
      {/* Título */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 00-6 6v1H2l1.528 6.112A4 4 0 007.368 18h5.264a4 4 0 003.84-2.888L18 9h-2V8a6 6 0 00-6-6zM6 9V8a4 4 0 118 0v1H6z" />
            </svg>
          </span>
          Configuración de Personal
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          Ajusta la cantidad de trabajadores disponibles para atender citas.
        </p>
      </div>

      {/* Formulario y nota */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr] items-start">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de trabajadores
          </label>
          <input
            type="number"
            min={1}
            value={staffCount}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`mt-3 w-full font-semibold py-2.5 rounded-lg shadow-md transition-colors ${
              isSaving
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* Nota informativa */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-indigo-800 leading-relaxed">
                <span className="font-medium">Nota:</span> Cada trabajador puede
                atender <strong>una cita a la vez</strong>. Con{" "}
                <strong>{staffCount}</strong>{" "}
                {staffCount === 1 ? "trabajador" : "trabajadores"}, el sistema
                permitirá hasta ese número de citas simultáneas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
