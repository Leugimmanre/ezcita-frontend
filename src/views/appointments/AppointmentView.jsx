// src/views/servicesViews/AppointmentView.jsx
import { useNavigate } from "react-router-dom";
import { MAX_SERVICES_SELECTION } from "@/data/index";
import Appointment from "@/components/servicesComponents/Appointment"; // Asegúrate de que este path es el del Appointment que editaste
import { useAppointment } from "@/hooks/useAppointment";
import { useEffect } from "react";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useAppointmentsData } from "@/hooks/useAppointmentsData";

export default function AppointmentView() {
  useDocumentTitle(`Nueva Cita | ${APP_NAME}`);
  const navigate = useNavigate();
  const { selectedServices, setSelectedServices } = useAppointment();
  const { data: settings, isLoading } = useAppointmentSettings();
  const { createAppointment, appointments } = useAppointmentsData();

  // Si no hay servicios seleccionados, volver a selección
  useEffect(() => {
    if (selectedServices.length === 0) {
      navigate("/appointments/new", { replace: true });
    }
  }, [selectedServices, navigate]);

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  // ✅ Handler robusto: acepta Date o { date, services, duration }
  const handleConfirmAppointment = (payload) => {
    let date;
    let services;

    if (payload instanceof Date) {
      // Versión antigua: el hijo enviaba un Date
      date = payload;
      services = selectedServices.map((s) => s._id);
    } else if (payload && typeof payload === "object") {
      // Versión nueva: el hijo envía { date, services, duration }
      date = payload.date;
      services = payload.services;
    } else {
      console.error("Payload inválido recibido en onConfirm:", payload);
      return;
    }

    // Normaliza fecha a ISO
    const isoDate =
      date instanceof Date ? date.toISOString() : new Date(date).toISOString();

    // Normaliza services a IDs (fallback al estado global si no vienen)
    const serviceIds =
      Array.isArray(services) && services.length > 0
        ? services
        : selectedServices.map((s) => s._id);

    createAppointment(
      {
        services: serviceIds,
        date: isoDate,
        notes: "",
        // duration: payload?.duration, // Descomenta si tu backend lo guarda en creación
      },
      {
        onSuccess: () => {
          setSelectedServices([]);
          navigate("/appointments/my-appointments");
        },
      }
    );
  };

  const goBackToServices = () => navigate("/appointments/new");

  if (isLoading) return <p className="text-white">Cargando configuración...</p>;

  return (
    <Appointment
      selectedServices={selectedServices}
      totalPrice={totalPrice}
      totalDuration={totalDuration}
      maxServices={MAX_SERVICES_SELECTION}
      onBack={goBackToServices}
      onClear={() => setSelectedServices([])}
      onRemove={(id) =>
        setSelectedServices((prev) => prev.filter((s) => s._id !== id))
      }
      onConfirm={handleConfirmAppointment}
      startHour={settings.startHour}
      endHour={settings.endHour}
      interval={settings.interval}
      lunchStart={settings.lunchStart}
      lunchEnd={settings.lunchEnd}
      maxMonthsAhead={settings.maxMonthsAhead}
      workingDays={settings.workingDays}
      appointments={appointments}
    />
  );
}
