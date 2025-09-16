// src/views/settingsViews/PrivacyPolicyView.jsx
import PrivacyPolicy from "@/components/pages/PrivacyPolicy";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function PrivacyPolicyView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Politicas de privacidad | ${brandName}`);

  return <PrivacyPolicy />;
}
