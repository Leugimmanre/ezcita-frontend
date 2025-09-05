// src/services/servicesAPI.jsx
import api from "@/lib/axios.js";

// Obtener todos los servicios con filtros opcionales
export const getServices = async () => {
  const response = await api.get("/services");
  return response.data.data;
};

// Obtener un servicio por ID
export const getServiceById = async (id) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

// Crear un nuevo servicio
export const createService = async (data) => {
  const response = await api.post("/services", data);
  return response.data;
};

// Actualizar un servicio por ID
export const updateService = async (id, data) => {
  const response = await api.put(`/services/${id}`, data);
  return response.data;
};

// Eliminar un servicio por ID (borrado lógico o físico)
export const deleteService = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};

// Subir UNA imagen a un servicio
export const uploadServiceImage = async ({ serviceId, file, alt = "" }) => {
  // Usar FormData para multipart
  const formData = new FormData();
  formData.append("file", file);
  if (alt) formData.append("alt", alt);

  const response = await api.post(`/services/${serviceId}/images`, formData, {
    headers: {
      // No fuerces Content-Type: axios lo gestiona con boundary
      // "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data || response.data;
};

// Eliminar UNA imagen del servicio
export const deleteServiceImage = async ({ serviceId, publicId }) => {
  const { data } = await api.delete(`/services/${serviceId}/images`, {
    params: { publicId },
  });
  return data.data;
};
