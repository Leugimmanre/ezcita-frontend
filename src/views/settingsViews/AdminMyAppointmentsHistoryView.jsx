// src/views/appointments/MyAppointmentsHistoryView.jsx
import AdminAppointmentsHistory from "@/components/settingsComponents/AdminAppointmentsHistory";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function AdminMyAppointmentsHistoryView() {
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Histórico de citas | ${brandName}`);

  return <AdminAppointmentsHistory />;
}
