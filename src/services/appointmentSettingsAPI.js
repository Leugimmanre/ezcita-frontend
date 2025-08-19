// src/services/appointmentSettingsAPI.js
import api from "@/lib/axios";

export const getAppointmentSettings = async () => {
  const res = await api.get("/appointment-settings");
  return res.data.data;
};

export const saveAppointmentSettings = async (data) => {
  const res = await api.post("/appointment-settings", data);
  return res.data.data;
};
