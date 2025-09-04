// src/pages/GenerateTimeSlotsView.js
import AppointmentSettings from "@/components/settingsComponents/AppointmentSettings";
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";

export default function GenerateTimeSlotsView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Horarios | ${brandName}`);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <AppointmentSettings />
    </div>
  );
}
