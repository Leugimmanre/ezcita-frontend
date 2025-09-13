// src/views/servicesViews/AppointmentView.jsx
import { useNavigate } from "react-router-dom";
import { MAX_SERVICES_SELECTION, APP_NAME } from "@/data/index";
import Appointment from "@/components/servicesComponents/Appointment";
import { useAppointment } from "@/hooks/useAppointment";
import { useEffect } from "react";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";
import { useDocumentTitle } from "@/hooks/title";
import { useBrandName } from "@/hooks/useBrandName";
import { useAppointmentsData } from "@/hooks/useAppointmentsData";
import { toast } from "react-toastify";

export default function AppointmentView() {
  const { brandName } = useBrandName(APP_NAME);
  useDocumentTitle(`Nueva Cita | ${brandName}`);

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

  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + Number(s.price ?? 0),
    0
  );
  const totalDuration = selectedServices.reduce((sum, s) => {
    const n = Number(s.duration) || 0;
    const mins = s.durationUnit?.toLowerCase() === "horas" ? n * 60 : n;
    return sum + mins;
  }, 0);

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

    // Valida y normaliza a Date
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
      {
        services: serviceIds,
        date: dateObj,
        duration,
        notes: "",
      },
      {
        onSuccess: () => {
          toast.success("Cita creada exitosamente");
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
