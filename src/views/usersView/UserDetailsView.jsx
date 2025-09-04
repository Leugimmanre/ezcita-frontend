import UserDetails from "@/components/settingsComponents/UserDetails";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function UserDetailsView() {
  // Título dinámico
  useDocumentTitle(`Detalles | ${APP_NAME}`);

  return <UserDetails />;
}
