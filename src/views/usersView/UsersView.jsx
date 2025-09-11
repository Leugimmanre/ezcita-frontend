// src/views/usersView/UsersView.jsx
import Users from "@/components/settingsComponents/Users";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function UsersView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Usuarios | ${brandName}`);
  return <Users />;
}
