// src/views/authViews/LoginView.jsx
import Login from "@/components/authComponents/Login";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function LoginView() {
  // Título dinámico
  useDocumentTitle(`Login | ${APP_NAME}`);

  return <Login />;
}
