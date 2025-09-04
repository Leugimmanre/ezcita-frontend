// src/views/authViews/ResetPasswordView.jsx
import ResetPassword from "@/components/authComponents/ResetPassword";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function ResetPasswordView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Recuperar contraseña | ${brandName}`);

  return <ResetPassword />;
}
