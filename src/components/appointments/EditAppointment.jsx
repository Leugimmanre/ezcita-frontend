// src/components/appointments/EditAppointment.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Appointment from "@/components/appointments/Appointment";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";
import {
  getAppointmentById,
  updateAppointment,
  getAppointments,
} from "@/services/appointmentsAPI";

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: settings } = useAppointmentSettings();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Cita a editar
        const apptResp = await getAppointmentById(id);
        const appt = apptResp?.data || apptResp;
        if (mounted) setAppointmentToEdit(appt);

        // Todas las citas (para solapes en el hijo)
        const list = await getAppointments();
        if (mounted) setAllAppointments(list);
      } catch (err) {
        console.error("Error al cargar la cita:", err);
        navigate("/appointments/my-appointments", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const handleBack = () => {
    navigate("/appointments/my-appointments");
  };

  // El hijo (Appointment) nos devuelve { date, services, duration }
  const handleSave = async ({ date, services, duration }) => {
    try {
      await updateAppointment(id, {
        date: new Date(date).toISOString(),
        services,
        duration,
      });
      navigate("/appointments/my-appointments", {
        state: { message: "Cita actualizada correctamente" },
        replace: true,
      });
    } catch (err) {
      console.error("Error al actualizar la cita:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!appointmentToEdit) {
    return <p className="text-white">Cita no encontrada</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Appointment
        isEditing
        appointmentToEdit={appointmentToEdit}
        onBack={handleBack}
        onConfirm={handleSave}
        startHour={settings?.startHour}
        endHour={settings?.endHour}
        interval={settings?.interval}
        lunchStart={settings?.lunchStart}
        lunchEnd={settings?.lunchEnd}
        maxMonthsAhead={settings?.maxMonthsAhead}
        workingDays={settings?.workingDays}
        staffCount={settings?.staffCount}
        appointments={allAppointments}
      />
    </div>
  );
}
