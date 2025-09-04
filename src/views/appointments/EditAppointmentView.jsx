import EditAppointment from "@/components/appointments/EditAppointment";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function EditAppointmentView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Editar Cita | ${brandName}`);

  return <EditAppointment />;
}
