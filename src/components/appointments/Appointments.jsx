// src/components/appointments/Appointments.jsx
import { useNavigate } from "react-router-dom";
import { MAX_SERVICES_SELECTION } from "@/data/index";
import Appointment from "@/components/appointments/Appointment";
import { useAppointment } from "@/hooks/useAppointment";
import { useEffect } from "react";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";
import { useAppointmentsData } from "@/hooks/useAppointmentsData";
import { toast } from "react-toastify";

export default function Appointments() {
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

  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + Number(s.price ?? 0),
    0
  );
  const toMinutes = (d, u) =>
    (u ?? "").toLowerCase() === "horas"
      ? Math.round((Number(d) || 0) * 60)
      : Math.round(Number(d) || 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + toMinutes(s.duration, s.durationUnit),
    0
  );

  // Confirmar cita
  const handleConfirmAppointment = (payloadOrDate) => {
    let date;
    let services;

    if (payloadOrDate instanceof Date) {
      date = payloadOrDate;
      services = selectedServices.map((s) => s._id);
    } else if (payloadOrDate && typeof payloadOrDate === "object") {
      date = payloadOrDate.date;
      services = payloadOrDate.services;
    } else {
      toast.error("Datos de la cita inválidos");
      return;
    }

    const duration =
      payloadOrDate && payloadOrDate.duration != null
        ? Number(payloadOrDate.duration) || 0
        : totalDuration;

    const dateObj = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      toast.error("Fecha inválida");
      return;
    }

    const serviceIds =
      Array.isArray(services) && services.length > 0
        ? services
        : selectedServices.map((s) => s._id);

    createAppointment(
      { services: serviceIds, date: dateObj, duration, notes: "" },
      {
        onSuccess: () => {
          setAppointmentDetails({
            services: selectedServices,
            totalPrice,
            duration,
            date: dateObj,
          });
          setSelectedServices([]);
          navigate("/appointments/my-appointments");
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.error ||
            err?.message ||
            "No se pudo crear la cita";
          toast.error(msg);
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
      interval={settings.interval}
      maxMonthsAhead={settings.maxMonthsAhead}
      appointments={appointments}
      dayBlocks={settings.dayBlocks}
      closedDates={settings.closedDates || []}
      staffCount={settings.staffCount}
    />
  );
}
