// src/services/appointmentSettingsAPI.js
import api from "@/lib/axios";

// Helper: convierte a ISO (lanza si inválida)
const toISO = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Fecha inválida");
  return d.toISOString();
};

// Obtener configuración
export const getAppointmentSettings = async () => {
  const res = await api.get("/appointment-settings");
  return res.data.data;
};

// Actualizar configuración
export const saveAppointmentSettings = async (data) => {
  // Enviamos SOLO campos del modo avanzado
  const payload = {
    // dayBlocks obligatorio
    dayBlocks: data.dayBlocks,
    // interval / maxMonthsAhead / staffCount obligatorios
    interval: Number(data.interval),
    maxMonthsAhead: Number(data.maxMonthsAhead),
    staffCount: Number(data.staffCount),
    // opcionales
    timezone: data.timezone,
    closedDates: Array.isArray(data.closedDates) ? data.closedDates : [],
  };

  const res = await api.post("/appointment-settings", payload);
  return res.data.data;
};

// Crear cita como ADMIN para cualquier usuario
export const adminCreateAppointment = async ({
  userId,
  services,
  date,
  notes = "",
  status = "confirmed",
}) => {
  const payload = {
    userId,
    services: Array.isArray(services)
      ? services.map((s) => (typeof s === "string" ? s : s._id))
      : [],
    date: toISO(date),
    notes,
    status,
  };
  const { data } = await api.post("/appointments/admin", payload);
  return data; // { message, appointment }
};

// Actualizar cita (admin o dueño)
export const updateAppointment = async (id, data) => {
  const payload = {
    ...data,
    services: Array.isArray(data.services)
      ? data.services.map((s) => (typeof s === "string" ? s : s._id))
      : undefined,
  };
  const res = await api.put(`/appointments/${id}`, payload);
  return res.data;
};
