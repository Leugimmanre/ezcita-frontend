// src/views/settingsViews/SettingsStaffView.jsx
import SettingsStaff from "@/components/settingsComponents/SettingsStaff";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";

export default function SettingsStaffView() {
  // Título dinámico
  useDocumentTitle(`Editar Cita | ${APP_NAME}`);

  return <SettingsStaff />;
}
