// src/views/authViews/ResetPasswordView.jsx
import Support from "@/components/authComponents/Support";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function SupportView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Soporte | ${brandName}`);

  return <Support />;
}
