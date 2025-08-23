// src/views/servicesViews/AppointmentView.jsx
import { useNavigate } from "react-router-dom";
import { MAX_SERVICES_SELECTION } from "@/data/index";
import Appointment from "@/components/appointments/Appointment";
import { useAppointment } from "@/hooks/useAppointment";
import { useEffect } from "react";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";
import { useDocumentTitle } from "@/hooks/title";
import { APP_NAME } from "@/data/index";
import { useAppointmentsData } from "@/hooks/useAppointmentsData";

export default function AppointmentView() {
  useDocumentTitle(`Cita$ | {APP_NAME} `);
  const navigate = useNavigate();

  const { selectedServices, setSelectedServices, setAppointmentDetails } =
    useAppointment();
  const { data: settings, isLoading } = useAppointmentSettings();
  const { createAppointment, appointments } = useAppointmentsData();

  useEffect(() => {
    if (selectedServices.length === 0) {
      navigate("/appointments/my-appointments", { replace: true });
    }
  }, [selectedServices, navigate]);

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  const handleConfirmAppointment = (dateTime) => {
    createAppointment(
      {
        services: selectedServices.map((s) => s._id),
        date: dateTime.toISOString(),
        notes: "",
      },
      {
        onSuccess: () => {
          setAppointmentDetails({
            services: selectedServices,
            totalPrice,
            totalDuration,
            date: dateTime,
          });
          setSelectedServices([]); // limpiar selección
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
      appointments={appointments} // 🔹 se lo pasamos al hijo
    />
  );
}
