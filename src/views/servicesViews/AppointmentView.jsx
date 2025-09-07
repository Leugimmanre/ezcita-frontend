// src/views/servicesViews/AppointmentView.jsx
import Appointments from "@/components/appointments/Appointments";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function AppointmentView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Citas | ${brandName} `);

  return <Appointments />;
}
