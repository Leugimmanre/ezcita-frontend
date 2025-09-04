// src/views/authViews/ResetPasswordView.jsx
import Verify from "@/components/authComponents/Verify";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function VerifyView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Verificación | ${brandName}`);

  return <Verify />;
}
