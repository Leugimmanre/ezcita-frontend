// src/views/authViews/RegistrationView.jsx
import Registration from "@/components/authComponents/Registration";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function RegistrationView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Registro | ${brandName}`);

  return <Registration />;
}
