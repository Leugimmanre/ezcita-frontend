// src/views/servicesViews/ServicesView.jsx
import ServicesList from "@/components/servicesComponents/ServicesList";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useBrandName } from "@/hooks/useBrandName";

export default function ServicesView() {
  // Título dinámico
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Servicios | ${brandName} `);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <ServicesList />
    </div>
  );
}
