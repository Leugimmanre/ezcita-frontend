import ForgotPassword from "@/components/authComponents/ForgotPassword";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function ForgotPasswordView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Login | ${brandName}`);

  return <ForgotPassword />;
}
