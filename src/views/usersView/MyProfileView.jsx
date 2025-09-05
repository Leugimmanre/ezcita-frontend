import MyProfile from "@/components/settingsComponents/MyProfile";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function MyProfileView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Mi perfil | ${brandName}`);
  return <MyProfile />;
}
