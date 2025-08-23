import SettingsHome from "@/components/settingsComponents/SettingsHome";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function SettingsHomeView() {
  // Título dinámico
  useDocumentTitle(`Ajustes | ${APP_NAME}`);

  return <SettingsHome />;
}
