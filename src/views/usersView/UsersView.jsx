import Users from "@/components/settingsComponents/Users";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";

export default function UsersView() {
  // Título dinámico
  useDocumentTitle(`Usuarios | ${APP_NAME}`);

  return <Users/>;
}
