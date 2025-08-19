// src/views/authViews/ResetPasswordView.jsx
import Verify from "@/components/authComponents/Verify";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function VerifyView() {
  // Título dinámico
  useDocumentTitle(`Verificación | ${APP_NAME}`);

  return <Verify />;
}
