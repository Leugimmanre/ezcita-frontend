// src/components/appointments/EditAppointment.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useAppointmentSettings } from "@/hooks/useAppointmentSettings";
import Appointment from "@/components/appointments/Appointment";
import { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const { data: settings } = useAppointmentSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Cargar la cita
        const apptResp = await getAppointmentById(id);
        const appt = apptResp?.data || apptResp;
        setAppointmentToEdit(appt);

        // 2) Cargar todas las citas para cálculo de solapes
        const appointmentsList = await getAppointments();
        setAllAppointments(appointmentsList);
      } catch (error) {
        console.error("Error al cargar la cita:", error);
        navigate("/appointments/my-appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Maneja la actualización de la cita
  const handleSave = async ({ date, services, duration }) => {
    try {
      await updateAppointment(id, {
        date: new Date(date).toISOString(),
        services,
        duration,
      });
      navigate("/appointments/my-appointments", {
        state: { message: "Cita actualizada correctamente" },
      });
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
    }
  };

  const handleBack = () => {
    navigate("/appointments/my-appointments");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!appointmentToEdit) {
    return <p className="text-white">Cita no encontrada</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Appointment
        appointmentToEdit={appointmentToEdit}
        onBack={handleBack}
        onConfirm={handleSave}
        startHour={settings.startHour}
        endHour={settings.endHour}
        interval={settings.interval}
        lunchStart={settings.lunchStart}
        lunchEnd={settings.lunchEnd}
        maxMonthsAhead={settings.maxMonthsAhead}
        workingDays={settings.workingDays}
        staffCount={settings.staffCount}
        appointments={allAppointments}
        isEditing={true}
      />
    </div>
  );
}
