// src/services/appointmentSettingsAPI.js
import api from "@/lib/axios";

// Helper: convierte a ISO (lanza si inválida)
const toISO = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Fecha inválida");
  return d.toISOString();
};

const WEEK_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const padHHmm = (t) => {
  if (!t) return "";
  const [h = "", m = ""] = String(t).split(":");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; // 9:00 -> 09:00
};

const toYMD = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export const normalizeAppointmentSettingsForAPI = (raw) => {
  const out = {
    interval:
      Number.isFinite(Number(raw?.interval)) && Number(raw.interval) >= 5
        ? Math.min(240, Math.max(5, Math.floor(Number(raw.interval))))
        : 30,
    maxMonthsAhead:
      Number.isFinite(Number(raw?.maxMonthsAhead)) &&
      Number(raw.maxMonthsAhead) >= 1
        ? Math.min(24, Math.max(1, Math.floor(Number(raw.maxMonthsAhead))))
        : 2,
    staffCount:
      Number.isFinite(Number(raw?.staffCount)) && Number(raw.staffCount) >= 1
        ? Math.min(50, Math.max(1, Math.floor(Number(raw.staffCount))))
        : 1,
    timezone:
      typeof raw?.timezone === "string"
        ? raw.timezone
        : raw?.timezone?.value || "Europe/Madrid",
    closedDates: Array.isArray(raw?.closedDates)
      ? raw.closedDates.map(toYMD).filter(Boolean)
      : [],
    dayBlocks: {},
  };

  const db = raw?.dayBlocks || {};
  WEEK_KEYS.forEach((k) => {
    const arr = Array.isArray(db[k]) ? db[k] : [];
    out.dayBlocks[k] = arr
      .filter((b) => b && b.start && b.end)
      .map((b) => ({
        start: padHHmm(b.start),
        end: padHHmm(b.end),
      }));
  });

  return out;
};

// Obtener configuración
export const getAppointmentSettings = async () => {
  const res = await api.get("/appointment-settings");
  return res.data.data;
};

// Actualizar configuración
export const saveAppointmentSettings = async (data) => {
  const payload = normalizeAppointmentSettingsForAPI(data);

  try {
    const res = await api.post("/appointment-settings", payload);
    return res.data.data;
  } catch (e) {
    // Mejora de mensaje para ver el motivo exacto del 400
    const msg =
      (e?.response?.data?.errors &&
        e.response.data.errors.map((x) => x.msg).join(" · ")) ||
      e?.response?.data?.error ||
      e?.message ||
      "Error al guardar configuración";
    throw new Error(msg);
  }
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
