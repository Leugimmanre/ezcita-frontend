import ForgotPassword from "@/components/authComponents/ForgotPassword";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function ForgotPasswordView() {
  // Título dinámico
  useDocumentTitle(`Login | ${APP_NAME}`);

  return <ForgotPassword />;
}
