// src/views/authViews/ResetPasswordView.jsx
import ResetPassword from "@/components/authComponents/ResetPassword";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function ResetPasswordView() {
  // Título dinámico
  useDocumentTitle(`Recuperar contraseña | ${APP_NAME}`);

  return <ResetPassword />;
}
