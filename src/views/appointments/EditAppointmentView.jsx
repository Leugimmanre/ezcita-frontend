import EditAppointment from "@/components/appointments/EditAppointment";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";

export default function EditAppointmentView() {
  // Título dinámico
  useDocumentTitle(`${APP_NAME} | Editar Cita`);

  return <EditAppointment />;
}
