// src/views/settingsViews/SettingsAppointmentsViews.jsx
import SettingsAppointments from "@/components/settingsComponents/SettingsAppointments";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";

export default function SettingsAppointmentsView() {
  // Título dinámico
  useDocumentTitle(`${APP_NAME} | Gestión de Citas`);

  return <SettingsAppointments />;
}
