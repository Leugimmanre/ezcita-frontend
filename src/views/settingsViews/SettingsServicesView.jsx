// src/views/settingsViews/SettingsServicesView.jsx
import SettingsServices from "@/components/settingsComponents/SettingsServices";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";

export default function SettingsServicesView() {
  // Título dinámico
  useDocumentTitle(`${APP_NAME} | Gestión de Servicios`);

  return <SettingsServices />;
}
