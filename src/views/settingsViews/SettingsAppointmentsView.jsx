// src/views/settingsViews/SettingsAppointmentsViews.jsx
import SettingsAppointments from "@/components/settingsComponents/SettingsAppointments";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";

export default function SettingsAppointmentsView() {
  // Título dinámico
  useDocumentTitle(`Gestión de Citas | ${APP_NAME}`);

  return <SettingsAppointments />;
}
