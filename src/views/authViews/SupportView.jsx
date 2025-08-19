// src/views/authViews/ResetPasswordView.jsx
import Support from "@/components/authComponents/Support";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function SupportView() {
  // Título dinámico
  useDocumentTitle(`Soporte | ${APP_NAME}`);

  return <Support />;
}
