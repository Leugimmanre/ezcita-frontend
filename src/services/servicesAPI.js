// src/services/servicesAPI.js
import api from "@/lib/axios.js";

// Normaliza a lo que espera el backend
const normalizeDurationUnitForAPI = (u) => {
  const v = String(u || "").toLowerCase();
  if (["min", "minute", "minutes", "minutos", "m", "min."].includes(v))
    return "minutes";
  if (["h", "hora", "horas", "hour", "hours"].includes(v)) return "hours";
  return "minutes";
};

// Crear un nuevo servicio
export const createService = async (data) => {
  const payload = {
    ...data,
    price: Number(data.price) || 0,
    duration: Number(data.duration) || 0,
    durationUnit: normalizeDurationUnitForAPI(data.durationUnit),
  };
  const { data: res } = await api.post("/services", payload);
  return res;
};

// Obtener todos los servicios
export const getServices = async () => {
  const { data } = await api.get("/services");
  // Homogeneizamos: devolvemos siempre data.data si existe
  return data?.data ?? [];
};

// Obtener un servicio por ID
export const getServiceById = async (id) => {
  const { data } = await api.get(`/services/${id}`);
  return data?.data ?? data;
};

// Actualizar un servicio por ID
export const updateService = async (id, data) => {
  const payload = {
    ...data,
    price: Number(data.price) || 0,
    duration: Number(data.duration) || 0,
    durationUnit: normalizeDurationUnitForAPI(data.durationUnit),
  };
  const { data: res } = await api.put(`/services/${id}`, payload);
  return res;
};

// Eliminar un servicio por ID
export const deleteService = async (id) => {
  const { data } = await api.delete(`/services/${id}`);
  return data?.data ?? data;
};

// Subir UNA imagen a un servicio
export const uploadServiceImage = async ({ serviceId, file, alt = "" }) => {
  const formData = new FormData();
  formData.append("image", file);
  if (alt) formData.append("alt", alt);

  const { data } = await api.post(`/services/${serviceId}/images`, formData);
  // El controller responde { success, data: imageDoc, ... }
  return data?.data ?? data;
};

// Eliminar UNA imagen del servicio
export const deleteServiceImage = async ({ serviceId, publicId }) => {
  const { data } = await api.delete(`/services/${serviceId}/images`, {
    data: { publicId },
  });
  return data?.data ?? data;
};
