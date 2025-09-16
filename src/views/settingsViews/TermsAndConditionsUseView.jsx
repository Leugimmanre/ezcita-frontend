// src/views/settingsViews/TermsAndConditionsUseView.jsx
import TermsAndConditionsUse from "@/components/pages/TermsAndConditionsUse";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function TermsAndConditionsUseView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Terminos legales | ${brandName}`);

  return <TermsAndConditionsUse />;
}
