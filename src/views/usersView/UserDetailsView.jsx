// src/views/usersView/UserDetailsView.jsx
import UserDetails from "@/components/settingsComponents/UserDetails";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function UserDetailsView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Detalles | ${brandName}`);

  return <UserDetails />;
}
