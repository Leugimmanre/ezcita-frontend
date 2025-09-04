// src/views/appointments/MyAppointmentsView.jsx
import MyAppointments from "@/components/appointments/MyAppointments";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function MyAppointmentsView() {
  // Título dinamico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Mis Citas | ${brandName}`);

  return <MyAppointments />;
}
