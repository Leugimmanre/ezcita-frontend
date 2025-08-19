// src/services/appointmentsAPI.js
import api from "@/lib/axios";

// Crear cita
export const createAppointment = async (data) => {
  const res = await api.post("/appointments", data);
  return res.data;
};

// Obtener citas del usuario autenticado
export const getAppointments = async (params) => {
  const res = await api.get("/appointments", params ? { params } : {});
  return res.data.appointments || [];
};

// Obtener citas en panel admin autenticado
export const getAppointments2 = async ({
  page = 1,
  limit = 10,
  status = "all",
  startDate,
  endDate,
} = {}) => {
  const params = { page: Number(page), limit: Number(limit) };

  // Solo manda status si no es "all"
  if (status && status !== "all") {
    params.status = status;
  }

  // Solo manda rango si tienes ambos
  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }

  const { data } = await api.get("/appointments", { params });
  return data; // { total, page, limit, appointments }
};

// Obtener una cita por ID
export const getAppointmentById = async (id) => {
  const res = await api.get(`/appointments/${id}`);
  return res.data;
};

// Actualizar cita
export const updateAppointment = async (id, data) => {
  // Normalizamos services para que sean SOLO IDs
  const payload = {
    ...data,
    services: data.services.map((s) => (typeof s === "string" ? s : s._id)),
  };

  const res = await api.put(`/appointments/${id}`, payload);
  return res.data;
};

// Cancelar cita
export const cancelAppointment = async (id) => {
  const res = await api.patch(`/appointments/${id}/cancel`);
  return res.data;
};

// Reactivar cita (solo admin)
export const reactivateAppointment = async (id) => {
  const res = await api.patch(`/appointments/${id}/reactivate`);
  return res.data;
};

// Completar cita
export const completeAppointment = async (id) => {
  const { data } = await api.patch(`/appointments/${id}/complete`);
  return data;
};

// Eliminar cita (solo admin)
export const deleteAppointment = async (id) => {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
};
