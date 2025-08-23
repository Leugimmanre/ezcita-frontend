// src/contexts/AppointmentProvider.jsx
import { useEffect, useState } from "react";
import { AppointmentContext } from "./AppointmentContext";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";

export function AppointmentProvider({ children }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [staffCount, setStaffCount] = useState(1);

  // Obtenemos datos del usuario desde localStorage
  const userData = JSON.parse(localStorage.getItem("user_EzCita"));

  // Cargamos configuración de citas
  const { data: settings, errorMessage, saveSettings } = useAppointmentSettings({
    enabled: userData?.role === "admin",
  });

  // Sincronizar staffCount con la configuración cargada
  useEffect(() => {
    if (settings?.staffCount) {
      setStaffCount(settings.staffCount);
    }
  }, [settings]);

  // Guardar número de trabajadores
  const saveStaffSettings = async (newCount) => {
    const updatedSettings = {
      ...settings,
      staffCount: newCount,
    };

    try {
      await saveSettings(updatedSettings);
      setStaffCount(newCount);
      return true;
    } catch (error) {
      console.error("Error saving staff settings:", error);
      return false;
    }
  };

  // Valor que se compartirá en el contexto
  const value = {
    selectedServices,
    setSelectedServices,
    appointmentDetails,
    setAppointmentDetails,
    staffCount,
    setStaffCount,
    saveStaffSettings,
    settingsError: errorMessage,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}
