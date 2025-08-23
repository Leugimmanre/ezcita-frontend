// src/views/authViews/BrandSettingsPageView.jsx
import BrandSettingsPage from "@/components/settingsComponents/BrandSettingsPage";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function BrandSettingsPageView() {
  // Título dinámico
  useDocumentTitle(`Marca | ${APP_NAME}`);

  return <BrandSettingsPage />;
}
