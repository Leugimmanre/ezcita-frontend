// src/views/settingsViews/AdminStatsDashboardView.jsx
import AdminStatsDashboard from "@/components/settingsComponents/AdminStatsDashboard";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function AdminStatsDashboardView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Dashboard | ${brandName}`);

  return <AdminStatsDashboard />;
}
