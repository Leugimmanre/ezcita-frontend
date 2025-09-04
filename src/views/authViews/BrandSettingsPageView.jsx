// src/views/authViews/BrandSettingsPageView.jsx
import BrandSettingsPage from "@/components/settingsComponents/BrandSettingsPage";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function BrandSettingsPageView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Marca | ${brandName}`);

  return <BrandSettingsPage />;
}
