// src/views/settingsViews/SettingsAppointmentsViews.jsx
import SettingsAppointments from "@/components/settingsComponents/SettingsAppointments";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function SettingsAppointmentsView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Gestión de Citas | ${brandName}`);

  return <SettingsAppointments />;
}
