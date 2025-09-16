// src/views/appointments/MyAppointmentsHistoryView.jsx
import MyAppointmentsHistory from "@/components/appointments/MyAppointmentsHistory";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function MyAppointmentsHistoryView() {
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Mi histórico de citas | ${brandName}`);

  return <MyAppointmentsHistory />;
}
