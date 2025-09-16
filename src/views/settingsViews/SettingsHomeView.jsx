// src/views/settingsViews/SettingsHomeView.jsx
import SettingsHome from "@/components/settingsComponents/SettingsHome";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function SettingsHomeView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Configuración | ${brandName}`);

  return <SettingsHome />;
}
