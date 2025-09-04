// src/views/settingsViews/SettingsStaffView.jsx
import SettingsStaff from "@/components/settingsComponents/SettingsStaff";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function SettingsStaffView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Personal | ${brandName}`);

  return <SettingsStaff />;
}
