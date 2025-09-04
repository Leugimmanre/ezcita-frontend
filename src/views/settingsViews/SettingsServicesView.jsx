// src/views/settingsViews/SettingsServicesView.jsx
import SettingsServices from "@/components/settingsComponents/SettingsServices";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function SettingsServicesView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Servicios | ${brandName}`);

  return <SettingsServices />;
}
