// src/views/appointments/MyAppointmentsView.jsx
import MyAppointments from "@/components/appointments/MyAppointments";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";

export default function MyAppointmentsView() {
  // Título dinamico
  useDocumentTitle(`Mis Citas | ${APP_NAME}`);

  return <MyAppointments />;
}
