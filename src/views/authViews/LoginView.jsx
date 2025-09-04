// src/views/authViews/LoginView.jsx
import Login from "@/components/authComponents/Login";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function LoginView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Login | ${brandName}`);

  return <Login />;
}
